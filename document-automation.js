// document-automation.js — Document processing and OCR automation for tax documents
// Handles T4, RL-1, Uber/Lyft statements, and expense receipts
// Adapted for TaxFlowAI from TaxSyncForDrivers

// Constants
const CONFIDENCE_NORMALIZATION_FACTOR = 3; // Normalize confidence to 0-1 range
const DEFAULT_TAX_RATE = 0.3; // 30% marginal tax rate estimate
const NUMERIC_FIELDS = [
  'amount',
  'income',
  'taxDeducted',
  'taxWithheld',
  'cpp',
  'ei',
  'qpp',
  'ppip',
  'grossEarnings',
  'tips',
  'fees',
  'grossIncome',
  'netAmount',
  'monthlyCost',
  'businessUse',
  'trips',
  'distance',
  'liters',
];
const TEXT_FIELDS = ['employer', 'payer', 'station', 'serviceType'];

const DOCUMENT_PATTERNS = {
  T4: {
    patterns: [
      'Statement of Remuneration Paid',
      'T4',
      'Employment Income',
      'Box 14',
      'Income Tax Deducted',
    ],
    extractors: {
      employer:
        /(?:Employer|Payer)[:\s]+([A-Z][A-Za-z\s&.,'-]+?(?:Inc|Ltd|Corp|Co)?\.?)(?:\n|Box|\d|$)/i,
      income: /(?:Employment income|Box 14)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
      taxDeducted: /(?:Income tax deducted|Box 22)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
      cpp: /(?:CPP contributions|Box 16)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
      ei: /(?:EI premiums|Box 18)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    },
  },

  RL1: {
    patterns: ['RL-1', 'Relevé 1', 'Case A', 'Box A', 'QPP', 'RRQ'],
    extractors: {
      employer:
        /(?:Employer|Payer|Employeur|Payeur)[:\s]+([A-Z][A-Za-z\s&.,'-]+?(?:Inc|Ltd|Corp|Co|Ltée)?\.?)(?:\n|Case|Box|\d|$)/i,
      income: /(?:Case A|Box A|Case\s+A)(?:[^:\d]*)?[:\s-]*\$?\s*([\d,]+\.?\d*)/i,
      qpp: /(?:Case B\.A|Box B\.A|Case\s+B\.A)(?:[^:\d]*)?[:\s-]*\$?\s*([\d,]+\.?\d*)/i,
      ei: /(?:Case C|Box C|Case\s+C)(?:[^:\d]*)?[:\s-]*\$?\s*([\d,]+\.?\d*)/i,
      ppip: /(?:Case H|Box H|Case\s+H)(?:[^:\d]*)?[:\s-]*\$?\s*([\d,]+\.?\d*)/i,
      taxDeducted: /(?:Case E|Box E|Case\s+E)(?:[^:\d]*)?[:\s-]*\$?\s*([\d,]+\.?\d*)/i,
    },
  },

  T4A: {
    patterns: ['T4A', 'Statement of Pension', 'Other Income', 'Box 048'],
    extractors: {
      payer: /(?:Payer|Payeur)[:\s]+([A-Z][A-Za-z\s&.,'-]+(?:Inc|Ltd|Corp|Co)?\.?)/i,
      amount: /(?:Other income|Box 048)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
      taxWithheld: /(?:Income tax deducted|Box 022)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    },
  },

  RL2: {
    patterns: ['RL-2', 'Relevé 2', 'Benefits', 'Prestations'],
    extractors: {
      benefitType: /(?:Type of benefit|Type de prestation)[:\s]*([A-Za-z\s]+)/i,
      amount: /(?:Amount|Montant)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    },
  },

  UBER_SUMMARY: {
    patterns: ['Uber', 'Weekly Summary', 'Driver Partner', 'Trip Earnings', 'Promotions'],
    extractors: {
      grossEarnings:
        /(?:Gross earnings?|Total earnings?|Trip earnings?)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
      trips: /(\d+)\s*trips?/i,
      distance: /([\d,]+\.?\d*)\s*(?:km|kilometers?)/i,
      tips: /(?:Tips?|Pourboires?)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
      fees: /(?:Uber fee|Service fee|Commission)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    },
  },

  LYFT_SUMMARY: {
    patterns: ['Lyft', 'Weekly Summary', 'Driver Dashboard', 'Ride Earnings'],
    extractors: {
      grossEarnings:
        /(?:Gross earnings?|Total earnings?|Ride earnings?)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
      trips: /(\d+)\s*(?:rides?|trips?)/i,
      distance: /([\d,]+\.?\d*)\s*(?:km|kilometers?|miles?)/i,
      tips: /(?:Tips?|Gratuities?)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
      fees: /(?:Lyft fee|Service fee|Commission)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    },
  },

  TAXI_STATEMENT: {
    patterns: ['Taxi', 'Cab', 'Company Statement', 'Driver Statement', 'Lease Fee'],
    extractors: {
      grossIncome: /(?:Gross income|Total fares?)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
      fees: /(?:Lease fee|Company fee|Dispatch fee)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
      netAmount: /(?:Net amount|Net income|Driver payment)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
    },
  },

  GAS_RECEIPT: {
    patterns: [
      'Shell',
      'Esso',
      'Petro-Canada',
      'Canadian Tire Gas',
      'Costco Gas',
      'Ultramar',
      'Fuel',
      'Gasoline',
      'Diesel',
    ],
    extractors: {
      amount: /(?:Total|Amount)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
      date: /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})|(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/,
      station: /(Shell|Esso|Petro-?Canada|Canadian Tire|Costco|Ultramar|Irving)/i,
      fuelType: /(Regular|Premium|Diesel|Electric)/i,
      liters: /([\d,]+\.?\d*)\s*(?:L|liters?|litres?)/i,
    },
  },

  MAINTENANCE: {
    patterns: [
      'Oil Change',
      'Tire',
      'Brake',
      'Service',
      'Repair',
      'Mechanic',
      'Auto Service',
      'Car Wash',
    ],
    extractors: {
      serviceType:
        /(Oil Change|Tire (?:Rotation|Change|Repair)|Brake (?:Service|Repair|Pads)|Tune[- ]?up|Inspection|Car Wash)/i,
      amount: /(?:Total|Amount|Balance Due)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
      date: /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})|(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/,
      mileage: /([\d,]+)\s*(?:km|kilometers?)/i,
    },
  },

  INSURANCE: {
    patterns: ['Insurance', 'Policy', 'Premium', 'Coverage', 'Desjardins', 'Intact'],
    extractors: {
      coveragePeriod: /(?:Coverage period|Policy period)[:\s]*([^\n]+)/i,
      amount: /(?:Total premium|Annual premium|Amount)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
      businessUse: /(?:Business use|Commercial)[:\s]*(\d+)%?/i,
    },
  },

  REGISTRATION: {
    patterns: ['Vehicle Registration', 'Immatriculation', 'SAAQ', 'License Plate'],
    extractors: {
      fees: /(?:Registration fee|Frais)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
      date: /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})|(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/,
    },
  },

  PARKING_TOLL: {
    patterns: ['Parking', 'Toll', 'Bridge', '407 ETR', 'Stationnement'],
    extractors: {
      amount: /(?:Total|Amount|Fee)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
      location: /(?:Location|Site)[:\s]*([A-Za-z\s,]+)/i,
      date: /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})|(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/,
    },
  },

  PHONE_BILL: {
    patterns: ['Rogers', 'Bell', 'Telus', 'Videotron', 'Fido', 'Koodo', 'Mobile'],
    extractors: {
      monthlyCost: /(?:Total|Amount Due|Balance)[:\s]*\$?\s*([\d,]+\.?\d*)/i,
      date: /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})|(\d{4}[-\/]\d{1,2}[-\/]\d{1,2})/,
    },
  },
};

// Classify document based on content
export function classifyDocument(text) {
  if (!text || typeof text !== 'string') {
    return { type: 'UNKNOWN', confidence: 0 };
  }

  const normalized = text.toUpperCase();
  const scores = {};

  for (const [docType, config] of Object.entries(DOCUMENT_PATTERNS)) {
    let score = 0;
    for (const pattern of config.patterns) {
      if (normalized.includes(pattern.toUpperCase())) {
        score += 1;
      }
    }
    scores[docType] = score;
  }

  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) {
    return { type: 'UNKNOWN', confidence: 0 };
  }

  const type = Object.keys(scores).find((k) => scores[k] === maxScore);
  const confidence = Math.min(maxScore / CONFIDENCE_NORMALIZATION_FACTOR, 1); // Normalize to 0-1

  return { type, confidence: Math.round(confidence * 100) / 100 };
}

// Extract data from document based on type
export function extractDocumentData(text, docType) {
  const pattern = DOCUMENT_PATTERNS[docType];
  if (!pattern || !text) {
    return { success: false, data: {} };
  }

  const data = {};
  let fieldsExtracted = 0;

  for (const [field, regex] of Object.entries(pattern.extractors)) {
    const match = text.match(regex);
    if (match) {
      let value = match[1] || match[0];

      // Clean up numeric values
      if (NUMERIC_FIELDS.includes(field)) {
        const cleanValue = String(value).replace(/,/g, '');
        value = parseFloat(cleanValue);
        if (isNaN(value)) {
          value = 0;
        }
      }

      // Clean up text values
      if (TEXT_FIELDS.includes(field)) {
        value = String(value).trim();
        // Special handling for gas station names - normalize to proper case
        if (field === 'station') {
          const stationMap = {
            shell: 'Shell',
            esso: 'Esso',
            'petro-canada': 'Petro-Canada',
            petrocanada: 'Petro-Canada',
            'canadian tire': 'Canadian Tire',
            costco: 'Costco',
            ultramar: 'Ultramar',
            irving: 'Irving',
          };
          const normalized = stationMap[value.toLowerCase().replace(/\s+/g, ' ')];
          if (normalized) {
            value = normalized;
          }
        }
      }

      data[field] = value;
      fieldsExtracted++;
    }
  }

  return {
    success: fieldsExtracted > 0,
    data,
    fieldsExtracted,
    totalFields: Object.keys(pattern.extractors).length,
  };
}

// Categorize expense based on document data
export function categorizeExpense(documentData) {
  const { type, data } = documentData;

  switch (type) {
    case 'GAS_RECEIPT':
      return {
        category: 'vehicle_fuel',
        type: 'expense',
        businessPercent: 80, // Default business use
        deductibleAmount: (data.amount || 0) * 0.8,
        description: `Fuel - ${data.station || 'Gas Station'} - ${data.date || 'N/A'}`,
        amount: data.amount || 0,
        taxSavings: ((data.amount || 0) * 0.8 * DEFAULT_TAX_RATE).toFixed(2),
      };

    case 'MAINTENANCE':
      return {
        category: 'vehicle_maintenance',
        type: 'expense',
        businessPercent: 100, // Usually 100% business for rideshare
        deductibleAmount: data.amount || 0,
        description: `${data.serviceType || 'Maintenance'} - ${data.date || 'N/A'}`,
        amount: data.amount || 0,
        taxSavings: ((data.amount || 0) * DEFAULT_TAX_RATE).toFixed(2),
      };

    case 'INSURANCE':
      return {
        category: 'vehicle_insurance',
        type: 'expense',
        businessPercent: data.businessUse || 80,
        deductibleAmount: (data.amount || 0) * ((data.businessUse || 80) / 100),
        description: `Insurance - ${data.coveragePeriod || 'Annual'}`,
        amount: data.amount || 0,
        taxSavings: (
          (data.amount || 0) *
          ((data.businessUse || 80) / 100) *
          DEFAULT_TAX_RATE
        ).toFixed(2),
      };

    case 'PARKING_TOLL':
      return {
        category: 'vehicle_parking',
        type: 'expense',
        businessPercent: 100,
        deductibleAmount: data.amount || 0,
        description: `Parking/Toll - ${data.location || ''} - ${data.date || 'N/A'}`,
        amount: data.amount || 0,
        taxSavings: ((data.amount || 0) * DEFAULT_TAX_RATE).toFixed(2),
      };

    case 'PHONE_BILL':
      return {
        category: 'communication',
        type: 'expense',
        businessPercent: 30, // Default 30% business use
        deductibleAmount: (data.monthlyCost || 0) * 0.3,
        description: `Phone/Data - Business portion`,
        amount: data.monthlyCost || 0,
        taxSavings: ((data.monthlyCost || 0) * 0.3 * DEFAULT_TAX_RATE).toFixed(2),
      };

    case 'REGISTRATION':
      return {
        category: 'vehicle_registration',
        type: 'expense',
        businessPercent: 80,
        deductibleAmount: (data.fees || 0) * 0.8,
        description: `Vehicle Registration - ${data.date || 'N/A'}`,
        amount: data.fees || 0,
        taxSavings: ((data.fees || 0) * 0.8 * DEFAULT_TAX_RATE).toFixed(2),
      };

    case 'UBER_SUMMARY':
    case 'LYFT_SUMMARY':
    case 'TAXI_STATEMENT':
      const income = data.grossEarnings || data.grossIncome || 0;
      const platformFees = data.fees || 0;
      const tips = data.tips || 0;
      return {
        category: 'rideshare_income',
        type: 'income',
        source: type === 'UBER_SUMMARY' ? 'Uber' : type === 'LYFT_SUMMARY' ? 'Lyft' : 'Taxi',
        amount: income,
        tips: tips,
        fees: platformFees,
        netIncome: income + tips - platformFees,
        trips: data.trips || 0,
        distance: data.distance || 0,
        description: `${type === 'UBER_SUMMARY' ? 'Uber' : type === 'LYFT_SUMMARY' ? 'Lyft' : 'Taxi'} income`,
        additionalTax: (income * DEFAULT_TAX_RATE).toFixed(2),
      };

    case 'T4':
    case 'RL1':
      return {
        category: 'employment_income',
        type: 'income',
        source: type,
        employer: data.employer || data.payer || 'Unknown',
        amount: data.income || 0,
        taxDeducted: data.taxDeducted || 0,
        cpp: data.cpp || 0,
        qpp: data.qpp || 0,
        ei: data.ei || 0,
        ppip: data.ppip || 0,
        description: `${type} - ${data.employer || data.payer || 'Employment income'}`,
        additionalTax: 0, // Tax already deducted
      };

    case 'T4A':
      return {
        category: 'other_income',
        type: 'income',
        source: 'T4A',
        payer: data.payer || 'Unknown',
        amount: data.amount || 0,
        taxWithheld: data.taxWithheld || 0,
        description: `T4A - ${data.payer || 'Other income'}`,
        additionalTax: ((data.amount || 0) * DEFAULT_TAX_RATE).toFixed(2),
      };

    case 'RL2':
      return {
        category: 'benefits',
        type: 'income',
        source: 'RL-2',
        benefitType: data.benefitType || 'Benefits',
        amount: data.amount || 0,
        description: `RL-2 - ${data.benefitType || 'Benefits'}`,
        additionalTax: ((data.amount || 0) * DEFAULT_TAX_RATE).toFixed(2),
      };

    default:
      return {
        category: 'uncategorized',
        type: 'unknown',
        description: 'Uncategorized document',
        amount: 0,
      };
  }
}

// Validate extracted data
export function validateExtractedData(data, docType) {
  const warnings = [];

  // Check for unusually large amounts
  if (data.amount && data.amount > 1000 && ['GAS_RECEIPT', 'PARKING_TOLL'].includes(docType)) {
    warnings.push('⚠️ Large expense amount - please verify');
  }

  if (data.amount && data.amount > 10000 && docType === 'MAINTENANCE') {
    warnings.push('⚠️ Very large maintenance expense - please verify');
  }

  // Check for future dates
  if (data.date) {
    const extractedDate = new Date(data.date);
    const today = new Date();
    if (extractedDate > today) {
      warnings.push('⚠️ Future date detected - please check');
    }
  }

  // Check for missing critical fields
  if (!data.amount && !data.income && !data.grossEarnings && !data.grossIncome) {
    warnings.push('⚠️ No amount detected - manual entry required');
  }

  return warnings;
}

// Process document end-to-end
export function processDocument(text) {
  if (!text || typeof text !== 'string') {
    return {
      success: false,
      error: 'Invalid document text',
    };
  }

  // Normalize text
  const cleanText = text.trim();

  // Classify document
  const classification = classifyDocument(cleanText);

  if (classification.type === 'UNKNOWN') {
    return {
      success: false,
      error: 'Unable to classify document type',
      text: cleanText.substring(0, 200), // Return snippet for debugging
    };
  }

  // Extract data
  const extraction = extractDocumentData(cleanText, classification.type);

  if (!extraction.success) {
    return {
      success: false,
      error: 'Failed to extract data from document',
      type: classification.type,
      confidence: classification.confidence,
    };
  }

  // Categorize
  const categorized = categorizeExpense({
    type: classification.type,
    data: extraction.data,
  });

  // Validate
  const warnings = validateExtractedData(extraction.data, classification.type);

  return {
    success: true,
    type: classification.type,
    confidence: classification.confidence,
    data: extraction.data,
    category: categorized,
    warnings,
    fieldsExtracted: extraction.fieldsExtracted,
    totalFields: extraction.totalFields,
  };
}

// Calculate confidence score
export function calculateConfidence(extractedData) {
  if (!extractedData || !extractedData.data) return 0;

  const fields = Object.keys(extractedData.data).length;
  const maxExpectedFields = extractedData.totalFields || 5;

  return Math.min((fields / maxExpectedFields) * 100, 100);
}

// Export document patterns for reference
export { DOCUMENT_PATTERNS };

// Default export
export default {
  classifyDocument,
  extractDocumentData,
  categorizeExpense,
  validateExtractedData,
  processDocument,
  calculateConfidence,
  DOCUMENT_PATTERNS,
};
