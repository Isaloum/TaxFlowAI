import { Request, Response } from 'express';
import prisma from '../config/database';
import { StorageService } from '../services/storage.service';
import { queueDocumentExtraction } from '../services/queue.service';
import { ValidationService } from '../services/validation.service';
import { NotificationService } from '../services/notifications/notification.service';

export class DocumentController {
  /**
   * POST /api/client/tax-years/:year/documents
   * Upload a document for a specific tax year
   */
  static async uploadDocument(req: Request, res: Response) {
    try {
      const clientId = req.user!.sub;
      const year = parseInt(req.params.year);
      const { docType, docSubtype } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      if (!docType) {
        return res.status(400).json({ error: 'docType is required' });
      }

      // Get or create TaxYear
      let taxYear = await prisma.taxYear.findUnique({
        where: {
          clientId_year: { clientId, year }
        }
      });

      if (!taxYear) {
        // Create new tax year with empty profile - will be populated by client during onboarding
        taxYear = await prisma.taxYear.create({
          data: {
            clientId,
            year,
            profile: {},
            status: 'draft'
          }
        });
      }

      // Upload to Supabase Storage
      const { url, fileSize, mimeType } = await StorageService.uploadDocument(
        req.file,
        clientId,
        year,
        docType
      );

      // Save document record
      const document = await prisma.document.create({
        data: {
          taxYearId: taxYear.id,
          docType,
          docSubtype,
          originalFilename: req.file.originalname,
          fileUrl: url,
          fileSizeBytes: fileSize,
          mimeType,
          extractionStatus: 'pending'
        }
      });

      // Queue for background processing
      await queueDocumentExtraction(document.id);

      // Trigger validation after upload
      await ValidationService.autoValidate(taxYear.id);

      // Send notification
      await NotificationService.notifyDocumentUploaded(
        clientId,
        docType,
        year
      );

      res.status(201).json({ 
        document,
        message: 'Document uploaded. Extraction in progress...'
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/client/tax-years/:year/documents
   * List all documents for a tax year
   */
  static async listDocuments(req: Request, res: Response) {
    try {
      const clientId = req.user!.sub;
      const year = parseInt(req.params.year);

      const taxYear = await prisma.taxYear.findUnique({
        where: {
          clientId_year: { clientId, year }
        },
        include: {
          documents: {
            orderBy: { uploadedAt: 'desc' }
          }
        }
      });

      if (!taxYear) {
        return res.status(404).json({ error: 'Tax year not found' });
      }

      res.json({ documents: taxYear.documents });
    } catch (error: any) {
      console.error('List error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * DELETE /api/client/documents/:id
   * Delete a document
   */
  static async deleteDocument(req: Request, res: Response) {
    try {
      const clientId = req.user!.sub;
      const documentId = req.params.id;

      // Verify ownership
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
          taxYear: {
            select: { clientId: true, id: true }
          }
        }
      });

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      if (document.taxYear.clientId !== clientId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Store taxYear id before deletion
      const taxYearId = document.taxYear.id;

      // Delete from storage
      await StorageService.deleteDocument(document.fileUrl);

      // Delete from database
      await prisma.document.delete({
        where: { id: documentId }
      });

      // Re-validate after deletion
      await ValidationService.autoValidate(taxYearId);

      res.json({ message: 'Document deleted' });
    } catch (error: any) {
      console.error('Delete error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/client/documents/:id/download
   * Get signed download URL
   */
  static async downloadDocument(req: Request, res: Response) {
    try {
      const clientId = req.user!.sub;
      const documentId = req.params.id;

      // Verify ownership
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
          taxYear: {
            select: { clientId: true }
          }
        }
      });

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      if (document.taxYear.clientId !== clientId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Get signed URL
      const downloadUrl = await StorageService.getDownloadUrl(document.fileUrl);

      res.json({ downloadUrl });
    } catch (error: any) {
      console.error('Download error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/client/documents/:id/extract
   * Manually trigger extraction (for retry or testing)
   */
  static async triggerExtraction(req: Request, res: Response) {
    try {
      const clientId = req.user!.sub;
      const documentId = req.params.id;

      // Verify ownership
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
          taxYear: {
            select: { clientId: true }
          }
        }
      });

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      if (document.taxYear.clientId !== clientId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Queue extraction
      await queueDocumentExtraction(documentId);

      res.json({ message: 'Extraction queued' });
    } catch (error: any) {
      console.error('Trigger extraction error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
