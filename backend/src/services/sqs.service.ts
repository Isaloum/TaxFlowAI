import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const sqs = new SQSClient({ region: process.env.AWS_REGION ?? 'us-east-1' });

/**
 * Send a document ID to the SQS extraction queue.
 * The Worker Lambda picks it up and runs OCR + AI classification.
 *
 * Falls back to inline processing if SQS_QUEUE_URL is not set (local dev).
 */
export async function enqueueExtraction(documentId: string): Promise<void> {
  const queueUrl = process.env.SQS_QUEUE_URL;

  if (!queueUrl) {
    // Local dev fallback — no SQS, run inline
    console.log(`[SQS] No SQS_QUEUE_URL — running extraction inline for ${documentId}`);
    const { ExtractionService } = await import('./extraction.service');
    ExtractionService.processDocument(documentId).catch((err: any) =>
      console.error('[SQS fallback] extraction error:', err?.message)
    );
    return;
  }

  await sqs.send(new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify({ documentId }),
    // MessageGroupId not needed — standard queue, not FIFO
  }));

  console.log(`[SQS] Enqueued document ${documentId} → ${queueUrl}`);
}
