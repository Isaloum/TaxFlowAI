import Queue from 'bull';
import { ExtractionService } from './extraction.service';

// Create extraction queue
export const extractionQueue = new Queue('document-extraction', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379',
  defaultJobOptions: {
    attempts: 3, // Retry up to 3 times
    backoff: {
      type: 'exponential',
      delay: 2000 // 2s, 4s, 8s
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});

// Process jobs
extractionQueue.process(async (job) => {
  const { documentId } = job.data;
  console.log(`🔄 Processing extraction job for document ${documentId}`);

  await ExtractionService.processDocument(documentId);

  return { documentId, status: 'success' };
});

// Error handling
extractionQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err);
});

extractionQueue.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

/**
 * Add document to extraction queue
 */
export async function queueDocumentExtraction(documentId: string) {
  await extractionQueue.add({ documentId });
  console.log(`📥 Queued document ${documentId} for extraction`);
}
