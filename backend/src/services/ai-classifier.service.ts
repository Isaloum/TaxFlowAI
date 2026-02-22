import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Canadian tax document types with required extraction fields
const DOCUMENT_TEMPLATES: Record<string, { fields: string[] }> = {
  T4:       { fields: ['employer_name', 'employee_sin', 'box_14_employment_income', 'box_22_income_tax_deducted'] },
  RL1:      { fields: ['employer_name', 'employee_nas', 'box_a_gross_income', 'box_e_income_tax_withheld'] },
  T4A:      { fields: ['payer_name', 'recipient_sin', 'box_16_pension_income'] },
  T4A_P:    { fields: ['recipient_sin', 'box_20_cpp_qpp_benefits'] },
  T4A_OAS:  { fields: ['recipient_sin', 'box_18_oas_pension'] },
  T4E:      { fields: ['recipient_sin', 'box_14_ei_benefits'] },
  RL6:      { fields: ['recipient_nas', 'box_a_ei_benefits'] },
  T4RIF:    { fields: ['payer_name', 'recipient_sin', 'box_16_rrif_income'] },
  T4RSP:    { fields: ['payer_name', 'recipient_sin', 'box_22_rrsp_income'] },
  RL2:      { fields: ['payer_name', 'recipient_nas', 'box_a_retirement_income'] },
  T5:       { fields: ['payer_name', 'recipient_sin', 'box_13_interest_income', 'box_24_eligible_dividends'] },
  T3:       { fields: ['trust_name', 'recipient_sin', 'box_21_capital_gains'] },
  RL3:      { fields: ['payer_name', 'recipient_nas', 'box_a_interest'] },
  T5008:    { fields: ['recipient_sin', 'box_20_proceeds', 'box_21_acb'] },
  T2202:    { fields: ['institution_name', 'student_name', 'tuition_fees', 'months_full_time'] },
  RL8:      { fields: ['institution_name', 'student_nas', 'box_a_tuition'] },
  T5007:    { fields: ['recipient_sin', 'box_10_workers_comp'] },
  RL5:      { fields: ['recipient_nas', 'box_a_benefits'] },
  T4FHSA:   { fields: ['issuer_name', 'recipient_sin', 'box_16_contributions'] },
  RL32:     { fields: ['issuer_name', 'recipient_nas', 'box_a_contributions'] },
  RL10:     { fields: ['issuer_name', 'recipient_nas', 'box_a_rrsp_contributions'] },
  RL31:     { fields: ['landlord_name', 'tenant_nas', 'box_a_rent_paid'] },
  T2201:    { fields: ['applicant_name', 'physician_name', 'certification_year'] },
  RRSP:     { fields: ['issuer_name', 'contributor_sin', 'contribution_amount', 'tax_year'] },
  RECEIPT:  { fields: ['vendor_name', 'amount', 'date', 'category'] },
};

export class AIClassifierService {
  /**
   * Classify document type and extract structured fields
   * COST: ~$0.0002 per document (GPT-4o-mini)
   */
  static async classifyAndExtract(ocrText: string): Promise<{
    docType: string;
    confidence: number;
    tax_year: number | null;
    taxpayer_name: string | null;
    extractedData: Record<string, any>;
  }> {
    const validTypes = Object.keys(DOCUMENT_TEMPLATES).join(', ');
    const prompt = `You are a Canadian tax document classifier and data extractor.

Given the OCR text below, determine:
1. Document type
2. The tax year the document covers (the year of income, NOT the filing year)
3. The taxpayer's full name
4. Key financial fields

OCR Text:
"""
${ocrText}
"""

Respond ONLY with valid JSON in this exact format:
{
  "docType": "T4",
  "confidence": 0.95,
  "tax_year": 2024,
  "taxpayer_name": "John Smith",
  "extractedData": {
    "employer_name": "ABC Corporation",
    "box_14_employment_income": "75000.00"
  }
}

Rules:
- docType must be one of: ${validTypes}, UNKNOWN
- confidence is 0.0–1.0
- tax_year is the 4-digit integer year shown on the slip (e.g. 2024), or null if not found
- taxpayer_name is the employee/recipient name, or null if not found
- extractedData: amounts as numeric strings without $ or commas, omit missing fields
- For Quebec RL slips use the French field names from the document`;

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
        docType:        result.docType       || 'UNKNOWN',
        confidence:     result.confidence    || 0,
        tax_year:       result.tax_year      || null,
        taxpayer_name:  result.taxpayer_name || null,
        extractedData:  result.extractedData || {},
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
