import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import archiver from 'archiver';
import axios from 'axios';
import prisma from '../config/database';
import { generateTemporaryPassword, SESEmailService } from '../services/ses-email.service';
import { NotificationService } from '../services/notifications/notification.service';
import { ValidationService } from '../services/validation.service';
import { StorageService } from '../services/storage.service';
import { enqueueExtraction } from '../services/sqs.service';

/**
 * POST /api/accountant/tax-years/:taxYearId/complete
 * Accountant marks a tax year as fully complete — triggers client email
 */
export const markAsComplete = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'accountant') {
      return res.status(403).json({ error: 'Only accountants can mark files as complete' });
    }

    const accountantId = req.user.sub;
    const { taxYearId } = req.params;

    const taxYear = await prisma.taxYear.findFirst({
      where: { id: taxYearId, client: { accountantId } },
      include: { client: { select: { id: true, firstName: true, lastName: true, email: true, province: true, languagePref: true } } },
    });

    if (!taxYear) {
      return res.status(404).json({ error: 'Tax year not found' });
    }

    if (taxYear.status === 'completed') {
      return res.status(400).json({ error: 'Already completed' });
    }

    // Guard: cannot complete with no documents
    const docCount = await prisma.document.count({ where: { taxYearId } });
    if (docCount === 0) {
      return res.status(400).json({ error: 'Cannot mark as complete — no documents uploaded' });
    }

    // Guard: cannot complete with rejected documents
    const rejectedCount = await prisma.document.count({ where: { taxYearId, reviewStatus: 'rejected' } });
    if (rejectedCount > 0) {
      return res.status(400).json({ error: `Cannot mark as complete — ${rejectedCount} document${rejectedCount > 1 ? 's' : ''} still rejected` });
    }

    const updated = await prisma.taxYear.update({
      where: { id: taxYearId },
      data: { status: 'completed', completedAt: new Date(), completenessScore: 100 },
    });

    // Send completion email to client (non-blocking)
    SESEmailService.sendTaxReturnCompletedEmail(
      taxYear.client.email,
      taxYear.client.firstName,
      taxYear.year,
      taxYear.client.languagePref
    ).catch(err => console.error('Completion email failed:', err));

    return res.json({ message: 'Marked as complete', taxYear: updated });
  } catch (error) {
    console.error('Mark as complete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/accountant/tax-years/:taxYearId/reopen
 * Accountant re-opens a completed tax year back to submitted
 */
export const reopenTaxYear = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'accountant') {
      return res.status(403).json({ error: 'Only accountants can re-open files' });
    }

    const accountantId = req.user.sub;
    const { taxYearId } = req.params;

    const taxYear = await prisma.taxYear.findFirst({
      where: { id: taxYearId, client: { accountantId } },
    });

    if (!taxYear) {
      return res.status(404).json({ error: 'Tax year not found' });
    }

    if (taxYear.status !== 'completed') {
      return res.status(400).json({ error: 'Only completed files can be re-opened' });
    }

    const updated = await prisma.taxYear.update({
      where: { id: taxYearId },
      data: { status: 'submitted', completedAt: null },
    });

    return res.json({ message: 'Tax year re-opened', taxYear: updated });
  } catch (error) {
    console.error('Re-open tax year error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * PATCH /api/accountant/tax-years/:taxYearId/notes
 * Save accountant's internal notes on a tax year (not visible to client)
 */
export const updateTaxYearNotes = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'accountant') {
      return res.status(403).json({ error: 'Only accountants can update notes' });
    }
    const accountantId = req.user.sub;
    const { taxYearId } = req.params;
    const { notes } = req.body;

    const taxYear = await prisma.taxYear.findFirst({
      where: { id: taxYearId, client: { accountantId } },
    });
    if (!taxYear) return res.status(404).json({ error: 'Tax year not found' });

    const updated = await prisma.taxYear.update({
      where: { id: taxYearId },
      data: { reviewNotes: notes ?? null },
    });
    return res.json({ message: 'Notes saved', reviewNotes: updated.reviewNotes });
  } catch (error) {
    console.error('Update notes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createClientSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  province: z.string().min(1, 'Province is required'),
  phone: z.string().optional(),
  languagePref: z.enum(['fr', 'en']).default('fr'),
});

export const createClient = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'accountant') {
      return res.status(403).json({ error: 'Only accountants can create clients' });
    }

    const validatedData = createClientSchema.parse(req.body);

    const existingClient = await prisma.client.findFirst({
      where: { email: validatedData.email },
      select: { id: true },
    });

    if (existingClient) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const accountant = await prisma.accountant.findUnique({
      where: { id: req.user.sub },
    });

    if (!accountant) {
      return res.status(404).json({ error: 'Accountant not found' });
    }

    const temporaryPassword = generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);

    const client = await prisma.client.create({
      data: {
        accountantId: req.user.sub,
        email: validatedData.email,
        passwordHash,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        province: validatedData.province,
        phone: validatedData.phone || '',
        languagePref: validatedData.languagePref,
        isFirstLogin: true,
      },
    });

    try {
      await SESEmailService.sendClientInvitationEmail(
        client.email,
        `${client.firstName} ${client.lastName}`,
        temporaryPassword,
        accountant.firmName,
        client.languagePref
      );
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
    }

    res.status(201).json({
      message: 'Client created successfully',
      client: {
        id: client.id,
        email: client.email,
        firstName: client.firstName,
        lastName: client.lastName,
        province: client.province,
        phone: client.phone,
        languagePref: client.languagePref,
        isFirstLogin: client.isFirstLogin,
        createdAt: client.createdAt,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create client error:', JSON.stringify({ message: error?.message, code: error?.code, meta: error?.meta }));
    res.status(500).json({ error: error?.message || 'Internal server error', code: error?.code });
  }
};

export const getClients = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'accountant') {
      return res.status(403).json({ error: 'Only accountants can view clients' });
    }

    const clients = await prisma.client.findMany({
      where: { accountantId: req.user.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        province: true,
        phone: true,
        languagePref: true,
        isFirstLogin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ clients });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getClientById = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'accountant') {
      return res.status(403).json({ error: 'Only accountants can view client details' });
    }

    const { id } = req.params;

    const client = await prisma.client.findFirst({
      where: {
        id,
        accountantId: req.user.sub,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        province: true,
        phone: true,
        languagePref: true,
        isFirstLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.status(200).json({ client });
  } catch (error) {
    console.error('Get client by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'accountant') {
      return res.status(403).json({ error: 'Only accountants can delete clients' });
    }

    const { id } = req.params;

    const client = await prisma.client.findFirst({
      where: {
        id,
        accountantId: req.user.sub,
      },
      select: { id: true },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await prisma.client.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/accountant/dashboard-stats
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'accountant') {
      return res.status(403).json({ error: 'Only accountants can view dashboard stats' });
    }

    const accountantId = req.user.sub;

    const [totalClients, pendingReview, completed, inProgress] = await Promise.all([
      prisma.client.count({ where: { accountantId } }),
      prisma.taxYear.count({
        where: {
          client: { accountantId },
          status: 'submitted'
        }
      }),
      prisma.taxYear.count({
        where: {
          client: { accountantId },
          status: 'completed'
        }
      }),
      prisma.taxYear.count({
        where: {
          client: { accountantId },
          status: 'in_review'
        }
      })
    ]);

    res.json({
      totalClients,
      pendingReview,
      completed,
      inProgress
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/accountant/clients-with-tax-years
 * List all clients with their latest tax year status
 */
export const getClientsWithTaxYears = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'accountant') {
      return res.status(403).json({ error: 'Only accountants can view clients' });
    }

    const accountantId = req.user.sub;

    const clients = await prisma.client.findMany({
      where: { accountantId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        province: true,
        taxYears: {
          orderBy: { year: 'desc' },
          take: 1,
          select: {
            id: true,
            year: true,
            status: true,
            completenessScore: true,
            submittedAt: true,
            documents: {
              select: {
                id: true,
                reviewStatus: true
              }
            }
          }
        }
      },
      orderBy: { lastName: 'asc' }
    });

    const clientSummaries = clients.map((client) => {
      const latestYear = client.taxYears[0];
      const pendingDocs = latestYear?.documents.filter(
        (d) => d.reviewStatus === 'pending'
      ).length || 0;

      return {
        id: client.id,
        name: `${client.firstName} ${client.lastName}`,
        email: client.email,
        province: client.province,
        latestYear: latestYear?.year,
        latestTaxYearId: latestYear?.id,
        status: latestYear?.status || 'no_data',
        completenessScore: latestYear?.completenessScore || 0,
        documentsCount: latestYear?.documents.length || 0,
        pendingReview: pendingDocs,
        submittedAt: latestYear?.submittedAt
      };
    });

    res.json({ clients: clientSummaries });
  } catch (error) {
    console.error('Get clients with tax years error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/accountant/clients/:clientId/years
 * Get all tax years for a specific client
 */
export const getClientTaxYears = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'accountant') {
      return res.status(403).json({ error: 'Only accountants can view client tax years' });
    }

    const accountantId = req.user.sub;
    const clientId = req.params.clientId;

    const client = await prisma.client.findFirst({
      where: { id: clientId, accountantId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        province: true,
        taxYears: {
          orderBy: { year: 'desc' },
          include: {
            documents: true,
            validations: true
          }
        }
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ client });
  } catch (error) {
    console.error('Get tax years error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/accountant/tax-years/:taxYearId
 * Get detailed tax year info
 */
export const getTaxYearDetails = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'accountant') {
      return res.status(403).json({ error: 'Only accountants can view tax year details' });
    }

    const accountantId = req.user.sub;
    const taxYearId = req.params.taxYearId;

    const taxYear = await prisma.taxYear.findFirst({
      where: {
        id: taxYearId,
        client: { accountantId }
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            province: true,
            phone: true,
            languagePref: true,
            isFirstLogin: true,
          }
        },
        documents: {
          orderBy: { uploadedAt: 'desc' }
        },
        validations: {
          orderBy: { checkedAt: 'desc' }
        }
      }
    });

    if (!taxYear) {
      return res.status(404).json({ error: 'Tax year not found' });
    }

    // Recalculate completeness on every view — but skip if already completed
    // (re-running on a completed year with 0 docs would reset score to 0)
    if (taxYear.status !== 'completed') {
      try { await ValidationService.autoValidate(taxYear.id); } catch (_) {}
    }
    const refreshed = await prisma.taxYear.findFirst({
      where: { id: taxYearId },
      include: {
        client: {
          select: {
            id: true, firstName: true, lastName: true, email: true,
            province: true, phone: true, languagePref: true, isFirstLogin: true,
          }
        },
        documents: { orderBy: { uploadedAt: 'desc' } },
        validations: { orderBy: { checkedAt: 'desc' } }
      }
    });

    res.json({ taxYear: refreshed ?? taxYear });
  } catch (error) {
    console.error('Get tax year details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/accountant/documents/:documentId/approve
 */
export const approveDocument = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'accountant') {
      return res.status(403).json({ error: 'Only accountants can approve documents' });
    }

    const accountantId = req.user.sub;
    const documentId = req.params.documentId;

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        taxYear: {
          client: { accountantId }
        }
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: {
        reviewStatus: 'approved',
        reviewedBy: accountantId,
        reviewedAt: new Date(),
        rejectionReason: null
      }
    });

    // Recalculate completeness after approval
    try { await ValidationService.autoValidate(document.taxYearId); } catch (_) {}

    res.json({ document: updated, message: 'Document approved' });
  } catch (error) {
    console.error('Approve document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/accountant/documents/:documentId/reject
 */
export const rejectDocument = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'accountant') {
      return res.status(403).json({ error: 'Only accountants can reject documents' });
    }

    const accountantId = req.user.sub;
    const documentId = req.params.documentId;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Rejection reason required' });
    }

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        taxYear: {
          client: { accountantId }
        }
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: {
        reviewStatus: 'rejected',
        reviewedBy: accountantId,
        reviewedAt: new Date(),
        rejectionReason: reason
      }
    });

    // Send rejection notification
    await NotificationService.notifyDocumentRejected(documentId, reason);

    // Recalculate completeness after rejection
    try { await ValidationService.autoValidate(document.taxYearId); } catch (_) {}

    res.json({ document: updated, message: 'Document rejected' });
  } catch (error) {
    console.error('Reject document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/accountant/tax-years/:taxYearId/download-package
 * Download all documents as ZIP
 */
export const downloadTaxPackage = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'accountant') {
      return res.status(403).json({ error: 'Only accountants can download tax packages' });
    }

    const accountantId = req.user.sub;
    const taxYearId = req.params.taxYearId;

    const taxYear = await prisma.taxYear.findFirst({
      where: {
        id: taxYearId,
        client: { accountantId }
      },
      include: {
        client: { select: { id: true, firstName: true, lastName: true, email: true, province: true } },
        documents: true
      }
    });

    if (!taxYear) {
      return res.status(404).json({ error: 'Tax year not found' });
    }

    if (taxYear.documents.length === 0) {
      return res.status(400).json({ error: 'No documents to download' });
    }

    const archive = archiver('zip', { zlib: { level: 9 } });

    res.attachment(
      `${taxYear.client.lastName}_${taxYear.client.firstName}_${taxYear.year}.zip`
    );
    archive.pipe(res);

    for (const doc of taxYear.documents) {
      try {
        const response = await axios.get(doc.fileUrl, {
          responseType: 'arraybuffer'
        });

        const filename = doc.originalFilename || `${doc.docType}_${doc.id}.pdf`;
        archive.append(Buffer.from(response.data), { name: filename });
      } catch (error) {
        console.error(`Failed to download ${doc.id}:`, error);
      }
    }

    const metadata = {
      client: `${taxYear.client.firstName} ${taxYear.client.lastName}`,
      year: taxYear.year,
      completenessScore: taxYear.completenessScore,
      documentsCount: taxYear.documents.length,
      generatedAt: new Date().toISOString()
    };

    archive.append(JSON.stringify(metadata, null, 2), {
      name: 'metadata.json'
    });

    await archive.finalize();
  } catch (error) {
    console.error('Download package error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * GET /api/accountant/documents/:documentId/download
 * Get a signed download URL so accountant can view the document
 */
export const getDocumentDownload = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'accountant') {
      return res.status(403).json({ error: 'Only accountants can download documents' });
    }
    const accountantId = req.user.sub;
    const { documentId } = req.params;

    const document = await prisma.document.findFirst({
      where: { id: documentId, taxYear: { client: { accountantId } } },
      select: { id: true, fileUrl: true, originalFilename: true }
    });

    if (!document) return res.status(404).json({ error: 'Document not found' });

    const downloadUrl = await StorageService.getDownloadUrl(document.fileUrl);
    res.json({ downloadUrl, filename: document.originalFilename });
  } catch (error) {
    console.error('Get document download error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/accountant/documents/:documentId/reset
 * Reset a document back to pending so accountant can re-review
 */
export const resetDocument = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'accountant') {
      return res.status(403).json({ error: 'Only accountants can reset documents' });
    }
    const { documentId } = req.params;
    const document = await prisma.document.findFirst({
      where: { id: documentId, taxYear: { client: { accountantId: req.user.sub } } }
    });
    if (!document) return res.status(404).json({ error: 'Document not found' });

    await prisma.document.update({
      where: { id: documentId },
      data: { reviewStatus: 'pending', reviewedBy: null, reviewedAt: null, rejectionReason: null }
    });

    try { await ValidationService.autoValidate(document.taxYearId); } catch (_) {}
    res.json({ message: 'Document reset to pending' });
  } catch (error) {
    console.error('Reset document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * POST /api/accountant/documents/:documentId/rescan
 * Re-trigger extraction on a failed/unreadable document
 */
export const rescanDocument = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'accountant') {
      return res.status(403).json({ error: 'Only accountants can rescan documents' });
    }
    const { documentId } = req.params;
    const document = await prisma.document.findFirst({
      where: { id: documentId, taxYear: { client: { accountantId: req.user.sub } } }
    });
    if (!document) return res.status(404).json({ error: 'Document not found' });

    // Reset extraction status and re-trigger
    await prisma.document.update({
      where: { id: documentId },
      data: { extractionStatus: 'pending' }
    });

    // Send to SQS — Worker Lambda handles OCR + AI async (no timeout risk)
    await enqueueExtraction(documentId);

    res.json({ message: 'Re-scan started' });
  } catch (error) {
    console.error('Rescan document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
