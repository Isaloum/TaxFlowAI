// tests/document-automation.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyDocument,
  extractDocumentData,
  categorizeExpense,
  validateExtractedData,
  processDocument,
  calculateConfidence,
  DOCUMENT_PATTERNS,
} from '../document-automation.js';

// ===== CLASSIFICATION TESTS =====

describe('classifyDocument', () => {
  it('should classify T4 document', () => {
    const text = 'Statement of Remuneration Paid T4 Box 14: 50000 Income Tax Deducted';
    const result = classifyDocument(text);
    assert.strictEqual(result.type, 'T4');
    assert.ok(result.confidence > 0);
  });

  it('should classify RL-1 document', () => {
    const text = 'Relevé 1 Case A: 60000 QPP Case B.A: 3500';
    const result = classifyDocument(text);
    assert.strictEqual(result.type, 'RL1');
    assert.ok(result.confidence > 0);
  });

  it('should classify Uber summary', () => {
    const text = 'Uber Weekly Summary Trip Earnings: $850 Promotions';
    const result = classifyDocument(text);
    assert.strictEqual(result.type, 'UBER_SUMMARY');
    assert.ok(result.confidence > 0);
  });

  it('should classify gas receipt', () => {
    const text = 'Shell Gasoline Regular Total: $65.43';
    const result = classifyDocument(text);
    assert.strictEqual(result.type, 'GAS_RECEIPT');
    assert.ok(result.confidence > 0);
  });

  it('should return UNKNOWN for unrecognized text', () => {
    const text = 'This is random text with no document patterns';
    const result = classifyDocument(text);
    assert.strictEqual(result.type, 'UNKNOWN');
    assert.strictEqual(result.confidence, 0);
  });

  it('should handle empty text', () => {
    const result = classifyDocument('');
    assert.strictEqual(result.type, 'UNKNOWN');
    assert.strictEqual(result.confidence, 0);
  });

  it('should handle null input', () => {
    const result = classifyDocument(null);
    assert.strictEqual(result.type, 'UNKNOWN');
    assert.strictEqual(result.confidence, 0);
  });

  it('should be case insensitive', () => {
    const text = 'uber weekly summary trip earnings';
    const result = classifyDocument(text);
    assert.strictEqual(result.type, 'UBER_SUMMARY');
  });
});

// ===== EXTRACTION TESTS =====

describe('extractDocumentData', () => {
  it('should extract T4 employment income', () => {
    const text = 'Employer: Acme Corp\nBox 14: 50,000.00\nBox 16: 3,166.45';
    const result = extractDocumentData(text, 'T4');
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data.income, 50000);
    assert.strictEqual(result.data.cpp, 3166.45);
    assert.strictEqual(result.data.employer, 'Acme Corp');
  });

  it('should extract RL-1 data with French labels', () => {
    const text = 'Employeur: TechCorp Inc.\nCase A: 60,000\nCase B.A: 3,500';
    const result = extractDocumentData(text, 'RL1');
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data.income, 60000);
    assert.strictEqual(result.data.qpp, 3500);
  });

  it('should extract Uber summary data', () => {
    const text = 'Gross earnings: $850.50\n45 trips\n350 km\nTips: $120\nUber fee: $170';
    const result = extractDocumentData(text, 'UBER_SUMMARY');
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data.grossEarnings, 850.5);
    assert.strictEqual(result.data.trips, 45);
    assert.strictEqual(result.data.distance, 350);
    assert.strictEqual(result.data.tips, 120);
    assert.strictEqual(result.data.fees, 170);
  });

  it('should extract gas receipt data', () => {
    const text = 'Shell\nRegular Gasoline\n45.5 L\nTotal: $65.43\n2025-01-15';
    const result = extractDocumentData(text, 'GAS_RECEIPT');
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data.amount, 65.43);
    assert.strictEqual(result.data.station, 'Shell');
    assert.strictEqual(result.data.liters, 45.5);
  });

  it('should handle missing data gracefully', () => {
    const text = 'Some random text';
    const result = extractDocumentData(text, 'T4');
    assert.strictEqual(result.success, false);
    assert.deepStrictEqual(result.data, {});
  });

  it('should return false for invalid document type', () => {
    const text = 'Box 14: 50000';
    const result = extractDocumentData(text, 'INVALID_TYPE');
    assert.strictEqual(result.success, false);
  });

  it('should handle numbers with commas', () => {
    const text = 'Box 14: 75,432.89';
    const result = extractDocumentData(text, 'T4');
    assert.strictEqual(result.data.income, 75432.89);
  });
});

// ===== CATEGORIZATION TESTS =====

describe('categorizeExpense', () => {
  it('should categorize gas receipt as vehicle fuel expense', () => {
    const documentData = {
      type: 'GAS_RECEIPT',
      data: { amount: 65.43, station: 'Shell', date: '2025-01-15' },
    };
    const result = categorizeExpense(documentData);
    assert.strictEqual(result.category, 'vehicle_fuel');
    assert.strictEqual(result.type, 'expense');
    assert.strictEqual(result.businessPercent, 80);
    assert.strictEqual(result.amount, 65.43);
    assert.ok(result.deductibleAmount > 0);
  });

  it('should categorize maintenance as vehicle maintenance expense', () => {
    const documentData = {
      type: 'MAINTENANCE',
      data: { amount: 250, serviceType: 'Oil Change', date: '2025-01-10' },
    };
    const result = categorizeExpense(documentData);
    assert.strictEqual(result.category, 'vehicle_maintenance');
    assert.strictEqual(result.businessPercent, 100);
    assert.strictEqual(result.amount, 250);
  });

  it('should categorize Uber summary as rideshare income', () => {
    const documentData = {
      type: 'UBER_SUMMARY',
      data: { grossEarnings: 850, tips: 120, fees: 170, trips: 45 },
    };
    const result = categorizeExpense(documentData);
    assert.strictEqual(result.category, 'rideshare_income');
    assert.strictEqual(result.type, 'income');
    assert.strictEqual(result.source, 'Uber');
    assert.strictEqual(result.amount, 850);
  });

  it('should categorize T4 as employment income', () => {
    const documentData = {
      type: 'T4',
      data: { income: 50000, employer: 'Acme Corp', cpp: 3166, ei: 815 },
    };
    const result = categorizeExpense(documentData);
    assert.strictEqual(result.category, 'employment_income');
    assert.strictEqual(result.type, 'income');
    assert.strictEqual(result.source, 'T4');
    assert.strictEqual(result.amount, 50000);
  });

  it('should categorize RL1 as employment income', () => {
    const documentData = {
      type: 'RL1',
      data: { income: 60000, employer: 'TechCorp', qpp: 3500, ppip: 350 },
    };
    const result = categorizeExpense(documentData);
    assert.strictEqual(result.category, 'employment_income');
    assert.strictEqual(result.source, 'RL1');
    assert.strictEqual(result.amount, 60000);
  });

  it('should calculate tax savings for expenses', () => {
    const documentData = {
      type: 'GAS_RECEIPT',
      data: { amount: 100 },
    };
    const result = categorizeExpense(documentData);
    assert.ok(parseFloat(result.taxSavings) > 0);
  });

  it('should handle unknown document type', () => {
    const documentData = {
      type: 'UNKNOWN',
      data: {},
    };
    const result = categorizeExpense(documentData);
    assert.strictEqual(result.category, 'uncategorized');
    assert.strictEqual(result.type, 'unknown');
  });
});

// ===== VALIDATION TESTS =====

describe('validateExtractedData', () => {
  it('should warn about large gas receipt amount', () => {
    const data = { amount: 1500 };
    const warnings = validateExtractedData(data, 'GAS_RECEIPT');
    assert.ok(warnings.length > 0);
    assert.ok(warnings[0].includes('Large expense amount'));
  });

  it('should warn about very large maintenance expense', () => {
    const data = { amount: 15000 };
    const warnings = validateExtractedData(data, 'MAINTENANCE');
    assert.ok(warnings.length > 0);
    assert.ok(warnings[0].includes('Very large'));
  });

  it('should warn about future dates', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const data = { date: futureDate.toISOString().split('T')[0], amount: 50 };
    const warnings = validateExtractedData(data, 'GAS_RECEIPT');
    assert.ok(warnings.some((w) => w.includes('Future date')));
  });

  it('should warn about missing amount', () => {
    const data = {};
    const warnings = validateExtractedData(data, 'GAS_RECEIPT');
    assert.ok(warnings.some((w) => w.includes('No amount')));
  });

  it('should return empty array for valid data', () => {
    const data = { amount: 50, date: '2025-01-15' };
    const warnings = validateExtractedData(data, 'GAS_RECEIPT');
    assert.strictEqual(warnings.length, 0);
  });
});

// ===== PROCESS DOCUMENT TESTS =====

describe('processDocument', () => {
  it('should process complete T4 document', () => {
    const text = `Statement of Remuneration Paid
    T4 - 2025
    Employer: TechCorp Inc.
    Box 14 Employment Income: $60,000.00
    Box 16 CPP Contributions: $3,166.45
    Box 18 EI Premiums: $1,049.40`;

    const result = processDocument(text);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.type, 'T4');
    assert.ok(result.confidence > 0);
    assert.strictEqual(result.data.income, 60000);
    assert.strictEqual(result.category.category, 'employment_income');
  });

  it('should process complete RL-1 document', () => {
    const text = `Relevé 1 - RL-1
    Employeur: Entreprise ABC Ltée
    Case A: 55,000
    Case B.A (RRQ): 3,200
    Case C (A-E): 900
    Case H (RQAP): 350`;

    const result = processDocument(text);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.type, 'RL1');
    assert.strictEqual(result.data.income, 55000);
    assert.strictEqual(result.data.qpp, 3200);
    assert.strictEqual(result.category.source, 'RL1');
  });

  it('should process Uber summary', () => {
    const text = `Uber Weekly Summary
    Trip Earnings: $850.50
    45 trips completed
    350 km driven
    Tips: $120.00
    Uber fee: $170.00`;

    const result = processDocument(text);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.type, 'UBER_SUMMARY');
    assert.strictEqual(result.data.grossEarnings, 850.5);
    assert.strictEqual(result.category.source, 'Uber');
  });

  it('should fail for unrecognized document', () => {
    const text = 'This is just random text with no patterns';
    const result = processDocument(text);
    assert.strictEqual(result.success, false);
    assert.ok(result.error.includes('Unable to classify'));
  });

  it('should handle empty text', () => {
    const result = processDocument('');
    assert.strictEqual(result.success, false);
  });

  it('should handle null input', () => {
    const result = processDocument(null);
    assert.strictEqual(result.success, false);
    assert.ok(result.error);
  });

  it('should include warnings in result', () => {
    const text = `Shell Gas Station
    Regular Gasoline
    Total: $1,500.00`;

    const result = processDocument(text);
    if (result.success) {
      assert.ok(result.warnings.length > 0);
    }
  });

  it('should track fields extracted', () => {
    const text = `T4 Statement
    Employer: ABC Corp
    Box 14: 50000`;

    const result = processDocument(text);
    assert.strictEqual(result.success, true);
    assert.ok(result.fieldsExtracted > 0);
    assert.ok(result.totalFields > 0);
  });
});

// ===== CONFIDENCE CALCULATION TESTS =====

describe('calculateConfidence', () => {
  it('should calculate confidence based on fields extracted', () => {
    const extractedData = {
      data: { income: 50000, cpp: 3166 },
      totalFields: 5,
    };
    const confidence = calculateConfidence(extractedData);
    assert.ok(confidence > 0);
    assert.ok(confidence <= 100);
  });

  it('should return 0 for no data', () => {
    const confidence = calculateConfidence(null);
    assert.strictEqual(confidence, 0);
  });

  it('should return 0 for empty data', () => {
    const extractedData = { data: {} };
    const confidence = calculateConfidence(extractedData);
    assert.strictEqual(confidence, 0);
  });

  it('should cap confidence at 100%', () => {
    const extractedData = {
      data: { field1: 1, field2: 2, field3: 3, field4: 4, field5: 5, field6: 6 },
      totalFields: 3,
    };
    const confidence = calculateConfidence(extractedData);
    assert.strictEqual(confidence, 100);
  });
});

// ===== DOCUMENT PATTERNS TESTS =====

describe('DOCUMENT_PATTERNS', () => {
  it('should export document patterns', () => {
    assert.ok(DOCUMENT_PATTERNS);
    assert.ok(typeof DOCUMENT_PATTERNS === 'object');
  });

  it('should include T4 pattern', () => {
    assert.ok(DOCUMENT_PATTERNS.T4);
    assert.ok(Array.isArray(DOCUMENT_PATTERNS.T4.patterns));
    assert.ok(DOCUMENT_PATTERNS.T4.extractors);
  });

  it('should include RL1 pattern', () => {
    assert.ok(DOCUMENT_PATTERNS.RL1);
    assert.ok(Array.isArray(DOCUMENT_PATTERNS.RL1.patterns));
    assert.ok(DOCUMENT_PATTERNS.RL1.extractors);
  });

  it('should include all expected document types', () => {
    const expectedTypes = [
      'T4',
      'RL1',
      'T4A',
      'RL2',
      'UBER_SUMMARY',
      'LYFT_SUMMARY',
      'TAXI_STATEMENT',
      'GAS_RECEIPT',
      'MAINTENANCE',
      'INSURANCE',
      'REGISTRATION',
      'PARKING_TOLL',
      'PHONE_BILL',
    ];
    expectedTypes.forEach((type) => {
      assert.ok(DOCUMENT_PATTERNS[type], `Missing pattern: ${type}`);
    });
  });
});

// ===== INTEGRATION TESTS =====

describe('Integration Tests', () => {
  it('should handle realistic T4 document', () => {
    const text = `
      STATEMENT OF REMUNERATION PAID - T4 - 2025
      EMPLOYER: TECHCORP INNOVATIONS INC.
      
      Box 14 - Employment income: 72,500.00
      Box 16 - CPP contributions: 3,867.50
      Box 18 - EI premiums: 1,049.40
      Box 22 - Income tax deducted: 14,250.00
      Box 44 - Union dues: 450.00
    `;

    const result = processDocument(text);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.type, 'T4');
    assert.strictEqual(result.data.income, 72500);
    assert.strictEqual(result.data.cpp, 3867.5);
    assert.strictEqual(result.data.ei, 1049.4);
    assert.strictEqual(result.data.taxDeducted, 14250);
  });

  it('should handle realistic RL-1 document', () => {
    const text = `
      RELEVÉ 1 - REVENUS D'EMPLOI ET REVENUS DIVERS - 2025
      Employeur: Services Financiers ABC Ltée
      
      Case A - Revenus d'emploi: 65,000
      Case B.A - Cotisation au RRQ: 3,776.10
      Case C - Cotisation à l'assurance-emploi: 900.00
      Case E - Impôt du Québec retenu: 9,750.00
      Case F - Cotisations syndicales: 550.00
      Case H - Cotisation au RQAP: 383.48
    `;

    const result = processDocument(text);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.type, 'RL1');
    assert.strictEqual(result.data.income, 65000);
    assert.strictEqual(result.data.qpp, 3776.1);
    assert.strictEqual(result.data.ppip, 383.48);
  });

  it('should handle realistic Uber summary', () => {
    const text = `
      UBER - WEEKLY SUMMARY
      Driver Partner Dashboard
      
      Gross earnings: $1,245.75
      68 trips completed
      520.5 km
      Tips: $185.00
      Uber service fee: $249.15
      Promotions: $50.00
    `;

    const result = processDocument(text);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.type, 'UBER_SUMMARY');
    assert.strictEqual(result.data.grossEarnings, 1245.75);
    assert.strictEqual(result.data.trips, 68);
    assert.strictEqual(result.data.tips, 185);
  });

  it('should handle realistic gas receipt', () => {
    const text = `
      SHELL CANADA
      GASOLINE REGULAR UNLEADED
      
      Litres: 52.3 L
      Price per litre: $1.45
      Total: $75.84
      Date: 2025-01-15
    `;

    const result = processDocument(text);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.type, 'GAS_RECEIPT');
    assert.strictEqual(result.data.amount, 75.84);
    assert.strictEqual(result.data.station, 'Shell');
    assert.strictEqual(result.data.liters, 52.3);
  });
});
