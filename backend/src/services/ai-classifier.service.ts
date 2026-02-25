import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Supported Canadian tax document types
const VALID_DOC_TYPES = [
  'T4', 'RL1', 'T4A', 'T4A_P', 'T4A_OAS', 'T4E', 'RL6',
  'T4RIF', 'T4RSP', 'RL2', 'T5', 'T3', 'RL3', 'T5008',
  'T2202', 'RL8', 'T5007', 'RL5', 'T4FHSA', 'RL32', 'RL10',
  'RL31', 'T2201', 'RRSP', 'RECEIPT', 'UNKNOWN'
];

export class AIClassifierService {
  /**
   * Classify document — extract only: doc type, tax year, taxpayer name.
   * No box numbers or amounts needed.
   */
  static async classifyAndExtract(ocrText: string): Promise<{
    docType: string;
    confidence: number;
    tax_year: number | null;
    taxpayer_name: string | null;
    extractedData: Record<string, any>;
  }> {
    const validTypes = VALID_DOC_TYPES.join(', ');
    // Truncate to first 1500 chars — doc type, year, and name always appear near the top.
    // Sending the full text wastes tokens and slows the response significantly.
    const truncatedText = ocrText.slice(0, 1500);
    const prompt = `Canadian tax document. Identify doc type, tax year, taxpayer name.

OCR Text (first 1500 chars):
"""
${truncatedText}
"""

Respond ONLY with JSON: {"docType":"T4","confidence":0.95,"tax_year":2024,"taxpayer_name":"John Smith"}

Rules:
- docType must be one of: ${validTypes}
- confidence: 0.0–1.0
- tax_year: 4-digit year on document, or null
- taxpayer_name: full name on document, or null
- Gig economy/Uber summaries: use RECEIPT`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        timeout: 15000,
        max_tokens: 80,         // We only need ~60 tokens for the JSON response
        messages: [
          {
            role: 'system',
            content: 'You are a Canadian tax document classifier. Respond with JSON only.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(
        completion.choices[0].message.content || '{}'
      );

      return {
        docType:       result.docType      || 'UNKNOWN',
        confidence:    result.confidence   || 0,
        tax_year:      result.tax_year     || null,
        taxpayer_name: result.taxpayer_name || null,
        extractedData: {},
      };
    } catch (error: any) {
      console.error('AI classification error:', error);
      throw new Error(`AI classification failed: ${error.message}`);
    }
  }

  /**
   * No-op — box validation removed. Kept for compatibility.
   */
  static validateExtraction(
    _docType: string,
    _extractedData: Record<string, any>
  ): { isValid: boolean; missingFields: string[] } {
    return { isValid: true, missingFields: [] };
  }
}
