import { PrismaClient } from '@prisma/client';
import { OCRService } from './ocr.service';
import { AIClassifierService } from './ai-classifier.service';

const prisma = new PrismaClient();

export class ExtractionService {
  /**
   * Process a document: OCR → AI Classification → Save results
   */
  static async processDocument(documentId: string): Promise<void> {
    try {
      // Get document from DB (include taxYear so we can detect year mismatches)
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: { taxYear: { select: { year: true } } },
      });

      if (!document) {
        throw new Error('Document not found');
      }

      // Update status to processing
      await prisma.document.update({
        where: { id: documentId },
        data: { extractionStatus: 'processing' }
      });

      console.log(`📄 Processing document ${documentId}...`);

      // Step 1: OCR extraction
      const { text, confidence, method } = await OCRService.extractText(
        document.fileUrl
      );

      console.log(`📝 OCR complete (${method}, confidence: ${confidence})`);

      if (!text || text.trim().length < 50) {
        throw new Error('Insufficient text extracted from document');
      }

      // Step 2: AI classification and field extraction
      const classification = await AIClassifierService.classifyAndExtract(
        text
      );

      console.log(
        `🤖 Classification: ${classification.docType} (confidence: ${classification.confidence})`
      );

      // Step 3: Validate extracted fields
      const validation = AIClassifierService.validateExtraction(
        classification.docType,
        classification.extractedData
      );

      if (!validation.isValid) {
        console.warn(`⚠️ Missing fields: ${validation.missingFields.join(', ')}`);
      }

      // Step 4: Mismatch detection
      const selectedDocType  = document.docType;               // what user chose
      const extractedDocType = classification.docType;         // what AI sees
      const expectedYear     = document.taxYear?.year ?? null; // e.g. 2024
      const extractedYear    = classification.tax_year;        // e.g. 2023

      // Normalise to compare (strip underscores/parentheses, uppercase)
      const norm = (s: string) => s.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      const typeMismatch =
        classification.confidence >= 0.80 &&
        extractedDocType !== 'UNKNOWN' &&
        norm(extractedDocType) !== norm(selectedDocType);

      const yearMismatch =
        extractedYear !== null &&
        expectedYear !== null &&
        extractedYear !== expectedYear;

      if (typeMismatch) {
        console.warn(`⚠️ Type mismatch: user selected "${selectedDocType}", AI detected "${extractedDocType}"`);
      }
      if (yearMismatch) {
        console.warn(`⚠️ Year mismatch: expected ${expectedYear}, document shows ${extractedYear}`);
      }

      // Step 5: Save results
      await prisma.document.update({
        where: { id: documentId },
        data: {
          extractedData: {
            ...classification.extractedData,
            tax_year:      classification.tax_year,
            taxpayer_name: classification.taxpayer_name,
            _metadata: {
              ocrMethod:                 method,
              ocrConfidence:             confidence,
              classificationConfidence:  classification.confidence,
              extractedDocType,
              selectedDocType,
              typeMismatch,
              yearMismatch,
              expectedYear,
              extractedYear,
              validationIssues:          validation.missingFields,
            },
          },
          extractionStatus:     'success',
          extractionConfidence: classification.confidence,
        },
      });

      console.log(`✅ Document ${documentId} processed successfully`);
    } catch (error: any) {
      console.error(`❌ Extraction failed for ${documentId}:`, error);

      // Update status to failed
      await prisma.document.update({
        where: { id: documentId },
        data: {
          extractionStatus: 'failed',
          extractedData: {
            error: error.message
          }
        }
      });

      throw error;
    }
  }
}
