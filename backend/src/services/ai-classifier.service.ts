import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Canadian tax document types with extraction templates
const DOCUMENT_TEMPLATES = {
  T4: {
    fields: [
      'employer_name',
      'employer_address',
      'employee_sin',
      'box_14_employment_income',
      'box_22_income_tax_deducted',
      'box_16_cpp_contributions',
      'box_18_ei_premiums'
    ]
  },
  RL1: {
    fields: [
      'employer_name',
      'employee_nas',
      'box_a_gross_income',
      'box_b_qpp_contribution',
      'box_c_qpip_premium',
      'box_e_income_tax_withheld'
    ]
  },
  T5: {
    fields: [
      'payer_name',
      'recipient_sin',
      'box_13_interest_income',
      'box_24_eligible_dividends',
      'box_25_other_dividends'
    ]
  },
  RL3: {
    fields: [
      'payer_name',
      'recipient_nas',
      'box_a_interest',
      'box_b_canadian_dividends'
    ]
  },
  T4A: {
    fields: [
      'payer_name',
      'recipient_sin',
      'box_16_pension_income',
      'box_18_lump_sum_payments',
      'box_48_fees_for_services'
    ]
  },
  T2202: {
    fields: [
      'institution_name',
      'student_name',
      'months_full_time',
      'months_part_time',
      'tuition_fees'
    ]
  },
  RECEIPT: {
    fields: ['vendor_name', 'amount', 'date', 'category', 'description']
  }
};

export class AIClassifierService {
  /**
   * Classify document type and extract structured fields
   * COST: ~$0.0002 per document (GPT-4o-mini)
   */
  static async classifyAndExtract(ocrText: string): Promise<{
    docType: string;
    confidence: number;
    extractedData: Record<string, any>;
  }> {
    const prompt = `You are a Canadian tax document classifier and data extractor.

Given the OCR text below, determine:
1. Document type (T4, RL-1, T5, RL-3, T2202, RL-8, RECEIPT, or UNKNOWN)
2. Extract relevant fields based on document type

OCR Text:
"""
${ocrText}
"""

Respond ONLY with valid JSON in this format:
{
  "docType": "T4",
  "confidence": 0.95,
  "extractedData": {
    "employer_name": "ABC Corporation",
    "box_14_employment_income": "75000.00",
    "box_22_income_tax_deducted": "15000.00",
    ...
  }
}

Rules:
- docType must be one of: T4, RL1, T5, RL3, T4A, T2202, RECEIPT, UNKNOWN
- confidence is 0-1 (how certain you are about the classification)
- extractedData contains only fields relevant to that document type
- Amounts should be numeric strings without $ or commas
- If a field is not found, omit it from extractedData (don't use null)
- For Quebec slips (RL-*), use French field names from the document`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // COST OPTIMIZATION: $0.15/1M tokens
        messages: [
          {
            role: 'system',
            content:
              'You are a precise Canadian tax document data extraction AI. Always respond with valid JSON only.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1, // Low temperature for consistent extraction
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(
        completion.choices[0].message.content || '{}'
      );

      return {
        docType: result.docType || 'UNKNOWN',
        confidence: result.confidence || 0,
        extractedData: result.extractedData || {}
      };
    } catch (error: any) {
      console.error('AI classification error:', error);
      throw new Error(`AI classification failed: ${error.message}`);
    }
  }

  /**
   * Validate extracted data against known document template
   */
  static validateExtraction(
    docType: string,
    extractedData: Record<string, any>
  ): { isValid: boolean; missingFields: string[] } {
    const template = DOCUMENT_TEMPLATES[docType as keyof typeof DOCUMENT_TEMPLATES];

    if (!template) {
      return { isValid: true, missingFields: [] }; // Unknown type, skip validation
    }

    const missingFields = template.fields.filter(
      (field) => !(field in extractedData)
    );

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }
}
