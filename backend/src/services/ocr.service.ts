/**
 * OCR Service — AWS Textract + pdf-parse
 *
 * Replaces Tesseract.js (which required native C++ binaries incompatible
 * with Lambda). Both libraries here are pure JS / AWS HTTP calls.
 *
 * Strategy:
 *  - PDF   → pdf-parse  (pure JS, fast, no binary dependencies)
 *  - Image → AWS Textract DetectDocumentText (HTTP call to AWS)
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

    if (contentType.includes('pdf') || fileUrl.toLowerCase().endsWith('.pdf')) {
      return OCRService.extractFromPdf(buffer);
    } else {
      return OCRService.extractFromImageTextract(buffer);
    }
  }

  private static async extractFromPdf(buffer: Buffer): Promise<{
    text: string; confidence: number; method: string;
  }> {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer, { max: 3 });
    return {
      text: data.text || '',
      confidence: data.text.trim().length > 50 ? 0.85 : 0.4,
      method: 'pdf-parse',
    };
  }

  private static async extractFromImageTextract(buffer: Buffer): Promise<{
    text: string; confidence: number; method: string;
  }> {
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

    return { text, confidence: avgConf, method: 'textract' };
  }
}
