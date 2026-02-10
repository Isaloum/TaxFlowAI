import { ExtractionService } from '../src/services/extraction.service';

const documentId = process.argv[2];

if (!documentId) {
  console.error('Usage: ts-node test-extraction.ts <documentId>');
  process.exit(1);
}

ExtractionService.processDocument(documentId)
  .then(() => {
    console.log('✅ Extraction complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Extraction failed:', err);
    process.exit(1);
  });
