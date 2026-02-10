import Tesseract from 'tesseract.js';
import vision from '@google-cloud/vision';
import axios from 'axios';

const visionClient = process.env.GOOGLE_CLOUD_VISION_KEY_PATH
  ? new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_CLOUD_VISION_KEY_PATH
    })
  : null;

export class OCRService {
  /**
   * Extract text using Tesseract (FREE)
   * COST: $0
   */
  static async extractWithTesseract(
    imageUrl: string
  ): Promise<{ text: string; confidence: number }> {
    try {
      // Download image
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer'
      });
      const buffer = Buffer.from(response.data);

      // Run Tesseract OCR
      const result = await Tesseract.recognize(buffer, 'eng+fra', {
        logger: (m) => console.log('Tesseract:', m)
      });

      return {
        text: result.data.text,
        confidence: result.data.confidence / 100 // 0-1 scale
      };
    } catch (error: any) {
      console.error('Tesseract error:', error);
      throw new Error(`Tesseract OCR failed: ${error.message}`);
    }
  }

  /**
   * Extract text using Google Vision API (FALLBACK)
   * COST: $1.50 per 1,000 images
   */
  static async extractWithGoogleVision(
    imageUrl: string
  ): Promise<{ text: string; confidence: number }> {
    if (!visionClient) {
      throw new Error('Google Vision API not configured');
    }

    try {
      const [result] = await visionClient.textDetection(imageUrl);
      const detections = result.textAnnotations;

      if (!detections || detections.length === 0) {
        return { text: '', confidence: 0 };
      }

      // First annotation is full text
      const fullText = detections[0].description || '';

      // Average confidence from all detections
      const avgConfidence =
        detections.slice(1).reduce((sum, d) => sum + (d.confidence || 0), 0) /
        (detections.length - 1 || 1);

      return {
        text: fullText,
        confidence: avgConfidence
      };
    } catch (error: any) {
      console.error('Google Vision error:', error);
      throw new Error(`Google Vision API failed: ${error.message}`);
    }
  }

  /**
   * Smart OCR: Try Tesseract first, fallback to Google Vision if needed
   * COST OPTIMIZATION: 70-80% of documents use FREE Tesseract
   */
  static async extractText(
    imageUrl: string
  ): Promise<{ text: string; confidence: number; method: string }> {
    // Try Tesseract first
    const tesseractResult = await this.extractWithTesseract(imageUrl);

    const threshold = parseFloat(
      process.env.TESSERACT_CONFIDENCE_THRESHOLD || '0.70'
    );

    if (tesseractResult.confidence >= threshold) {
      console.log(
        `✅ Tesseract success (confidence: ${tesseractResult.confidence})`
      );
      return { ...tesseractResult, method: 'tesseract' };
    }

    // Fallback to Google Vision if enabled
    if (process.env.USE_GOOGLE_VISION_FALLBACK === 'true' && visionClient) {
      console.log(
        `⚠️ Tesseract low confidence (${tesseractResult.confidence}), trying Google Vision...`
      );
      const visionResult = await this.extractWithGoogleVision(imageUrl);
      return { ...visionResult, method: 'google-vision' };
    }

    // No fallback, use Tesseract result anyway
    console.log(
      `⚠️ Using Tesseract result despite low confidence (${tesseractResult.confidence})`
    );
    return { ...tesseractResult, method: 'tesseract-low-confidence' };
  }
}
