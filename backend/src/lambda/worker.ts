import { SQSEvent, SQSBatchResponse, SQSBatchItemFailure } from 'aws-lambda';
import { ExtractionService } from '../services/extraction.service';

/**
 * Worker Lambda — triggered by SQS ExtractionQueue.
 *
 * BatchSize = 1, so each invocation processes exactly one document.
 * ReportBatchItemFailures = true, so if this throws, SQS retries just
 * this message (up to maxReceiveCount=3), then moves it to the DLQ.
 */
export const handler = async (event: SQSEvent): Promise<SQSBatchResponse> => {
  const failures: SQSBatchItemFailure[] = [];

  for (const record of event.Records) {
    const { documentId } = JSON.parse(record.body) as { documentId: string };
    console.log(`[worker] processing document ${documentId}`);

    try {
      await ExtractionService.processDocument(documentId);
      console.log(`[worker] ✅ done — ${documentId}`);
    } catch (err: any) {
      console.error(`[worker] ❌ failed — ${documentId}:`, err?.message);
      // Return this message ID as a failure so SQS retries it
      failures.push({ itemIdentifier: record.messageId });
    }
  }

  // SQS will retry failed items, and move to DLQ after maxReceiveCount attempts
  return { batchItemFailures: failures };
};
