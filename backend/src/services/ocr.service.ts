/**
 * OCR Service
 *
 * Strategy:
 *  - PDF   → pdf-parse (pure JS, no binaries, works in Lambda)
 *  - Image (JPEG/PNG) → AWS Textract DetectDocumentText
 *
 * IMPORTANT: Textract sync API (DetectDocumentText) does NOT support PDF bytes.
 * It only supports JPEG and PNG images via the Bytes parameter.
 * PDFs must use pdf-parse only.
 */
import { TextractClient, DetectDocumentTextCommand } from '@aws-sdk/client-textract';
import axios from 'axios';

const textract = new TextractClient({ region: process.env.AWS_REGION || 'us-east-1' });

export class OCRService {
  static async extractText(fileUrl: string): Promise<{
    text: string;
    confidence: number;
    method: string;
  }> {
    const response = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
      timeout: 15_000,
    });
    const buffer = Buffer.from(response.data);
    const contentType: string = response.headers['content-type'] || '';
    console.log(`[OCR] contentType: ${contentType}, bufferSize: ${buffer.length}`);

    // Route by content type — NOT by URL (signed URLs have tokens appended)
    if (contentType.includes('pdf')) {
      return OCRService.extractFromPdf(buffer);
    } else {
      return OCRService.extractFromImageTextract(buffer);
    }
  }

  private static async extractFromPdf(buffer: Buffer): Promise<{
    text: string; confidence: number; method: string;
  }> {
    // pdf-parse: pure JS PDF text extraction, Lambda-compatible
    // NOTE: Textract sync API does NOT support PDF bytes — do not use as fallback
    try {
      // Use require() — dynamic import breaks with esbuild bundling (default is not a function)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer, { max: 3 }); // first 3 pages — doc type/name/year always there
      const text = (data.text || '').trim();
      console.log(`[pdf-parse] extracted ${text.length} chars`);
      return {
        text,
        confidence: text.length > 50 ? 0.85 : 0.3,
        method: 'pdf-parse',
      };
    } catch (err: any) {
      console.error('[pdf-parse] failed:', err.message);
      throw new Error(`PDF text extraction failed: ${err.message}`);
    }
  }

  private static async extractFromImageTextract(buffer: Buffer): Promise<{
    text: string; confidence: number; method: string;
  }> {
    // Textract: JPEG/PNG images only via Bytes parameter
    const command = new DetectDocumentTextCommand({
      Document: { Bytes: buffer },
    });
    const result = await textract.send(command);
    const blocks = result.Blocks || [];

    const lines: string[] = [];
    const confidences: number[] = [];
    for (const block of blocks) {
      if (block.BlockType === 'LINE' && block.Text) {
        lines.push(block.Text);
        if (block.Confidence != null) confidences.push(block.Confidence / 100);
      }
    }

    const text = lines.join('\n');
    const avgConf = confidences.length
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0;

    console.log(`[textract] extracted ${text.length} chars, confidence: ${avgConf}`);
    return { text, confidence: avgConf, method: 'textract' };
  }
}
