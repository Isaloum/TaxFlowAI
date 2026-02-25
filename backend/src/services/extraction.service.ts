import { PrismaClient } from '@prisma/client';
import { OCRService } from './ocr.service';
import { AIClassifierService } from './ai-classifier.service';
import { StorageService } from './storage.service';

const prisma = new PrismaClient();

export class ExtractionService {
  static async processDocument(documentId: string): Promise<void> {
    console.log(`🔖 ExtractionService v2 — doc: ${documentId}`);
    let ownerName: string | null = null;

    try {
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: { taxYear: { select: { year: true } } },
      });

      if (!document) throw new Error('Document not found');

      ownerName = (document.extractedData as any)?._ownerName ?? null;

      await prisma.document.update({
        where: { id: documentId },
        data: { extractionStatus: 'processing' }
      });

      // Step 1: OCR — use signed URL (works whether bucket is public or private)
      const signedUrl = await StorageService.getDownloadUrl(document.fileUrl);
      const { text, confidence, method } = await OCRService.extractText(signedUrl);
      console.log(`📝 OCR complete (${method}, confidence: ${confidence}, chars: ${text?.length ?? 0})`);

      // Step 2: Name check — ALWAYS runs first, even if text is short
      // Uses simple text search — no AI needed
      const normName = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();
      const hasText = !!(text && text.trim().length > 0);
      const nameMismatch =
        ownerName !== null &&
        ownerName.trim().length > 0 &&
        hasText &&
        !normName(text).includes(normName(ownerName));

      console.log(`🔍 Name check — ownerName: "${ownerName}", hasText: ${hasText}, nameMismatch: ${nameMismatch}`);
      if (nameMismatch) console.warn(`⚠️ Name mismatch: "${ownerName}" not found in doc`);

      // ✅ Save name check result NOW — before anything else can fail
      await prisma.document.update({
        where: { id: documentId },
        data: {
          extractedData: {
            ...(ownerName ? { _ownerName: ownerName } : {}),
            _metadata: { nameMismatch, ownerName },
          }
        }
      });

      if (!text || text.trim().length < 50) {
        throw new Error('Insufficient text extracted from document');
      }

      // Step 3: AI classification — doc type + year
      const classification = await AIClassifierService.classifyAndExtract(text);
      console.log(`🤖 Classification: ${classification.docType} (confidence: ${classification.confidence})`);

      // Step 4: Type + year mismatch
      const norm = (s: string) => s.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      const typeMismatch =
        classification.confidence >= 0.80 &&
        classification.docType !== 'UNKNOWN' &&
        norm(classification.docType) !== norm(document.docType);

      const yearMismatch =
        classification.tax_year !== null &&
        document.taxYear?.year != null &&
        classification.tax_year !== document.taxYear.year;

      // Step 5: Save final result
      await prisma.document.update({
        where: { id: documentId },
        data: {
          extractedData: {
            ...(ownerName ? { _ownerName: ownerName } : {}),
            tax_year:      classification.tax_year,
            taxpayer_name: classification.taxpayer_name,
            _metadata: {
              ocrMethod:    method,
              ocrConfidence: confidence,
              classificationConfidence: classification.confidence,
              extractedDocType: classification.docType,
              selectedDocType:  document.docType,
              typeMismatch,
              yearMismatch,
              nameMismatch,
              expectedYear:  document.taxYear?.year ?? null,
              extractedYear: classification.tax_year,
              ownerName,
              extractedName: classification.taxpayer_name,
            },
          },
          extractionStatus:     'success',
          extractionConfidence: classification.confidence,
        },
      });

      console.log(`✅ Document ${documentId} processed successfully`);
    } catch (error: any) {
      console.error(`❌ Extraction failed for ${documentId}:`, error);

      // Read existing metadata to preserve nameMismatch if it was already saved
      const existing = await prisma.document.findUnique({
        where: { id: documentId },
        select: { extractedData: true }
      });
      const existingMeta = (existing?.extractedData as any)?._metadata ?? {};

      await prisma.document.update({
        where: { id: documentId },
        data: {
          extractionStatus: 'failed',
          extractedData: {
            ...(ownerName ? { _ownerName: ownerName } : {}),
            _metadata: {
              ...existingMeta, // preserve nameMismatch if already saved
              extractionError: error.message,
            }
          }
        }
      });

      throw error;
    }
  }
}
