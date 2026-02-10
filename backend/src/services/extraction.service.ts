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
      // Get document from DB
      const document = await prisma.document.findUnique({
        where: { id: documentId }
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

      // Step 3: Validate extraction
      const validation = AIClassifierService.validateExtraction(
        classification.docType,
        classification.extractedData
      );

      if (!validation.isValid) {
        console.warn(
          `⚠️ Missing fields: ${validation.missingFields.join(', ')}`
        );
      }

      // Step 4: Save results
      await prisma.document.update({
        where: { id: documentId },
        data: {
          docType: classification.docType,
          extractedData: {
            ...classification.extractedData,
            _metadata: {
              ocrMethod: method,
              ocrConfidence: confidence,
              classificationConfidence: classification.confidence,
              validationIssues: validation.missingFields
            }
          },
          extractionStatus: 'success',
          extractionConfidence: classification.confidence
        }
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
