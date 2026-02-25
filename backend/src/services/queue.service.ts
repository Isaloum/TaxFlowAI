import Queue from 'bull';
// ExtractionService is a dynamic import — it pulls in tesseract.js and
// @google-cloud/vision which are External (not bundled) and crash Lambda if
// imported at module level

// Lazy queue — only created if REDIS_URL is set (not in Lambda without Redis)
let extractionQueue: Queue.Queue | null = null;

function getQueue(): Queue.Queue | null {
  if (!process.env.REDIS_URL) return null;

  if (!extractionQueue) {
    extractionQueue = new Queue('document-extraction', {
      redis: process.env.REDIS_URL,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });

    extractionQueue.process(async (job) => {
      const { documentId } = job.data;
      console.log(`🔄 Processing extraction job for document ${documentId}`);
      const { ExtractionService } = await import('./extraction.service');
      await ExtractionService.processDocument(documentId);
      return { documentId, status: 'success' };
    });

    extractionQueue.on('failed', (job, err) => {
      console.error(`❌ Job ${job.id} failed:`, err);
    });

    extractionQueue.on('completed', (job) => {
      console.log(`✅ Job ${job.id} completed`);
    });
  }

  return extractionQueue;
}

/**
 * Add document to extraction queue.
 * If no Redis (Lambda without REDIS_URL), falls back to direct processing.
 */
export async function queueDocumentExtraction(documentId: string) {
  const queue = getQueue();

  if (queue) {
    await queue.add({ documentId });
    console.log(`📥 Queued document ${documentId} for extraction`);
  } else {
    // No Redis — run extraction directly (fire-and-forget)
    console.log(`⚡ No Redis, running extraction directly for ${documentId}`);
    import('./extraction.service').then(({ ExtractionService }) =>
      ExtractionService.processDocument(documentId)
    ).catch((err) =>
      console.error(`Extraction failed for ${documentId}:`, err)
    );
  }
}
