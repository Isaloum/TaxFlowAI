# 📧 Email Integration Guide - TaxFlowAI

## Overview

The TaxFlowAI document automation system allows users to process tax documents (T4, RL-1, receipts) automatically through email integration. This guide explains how to set up and use the email automation features.

## Features

✅ **Automated Document Processing** - Forward tax documents via email for instant processing  
✅ **Multi-Format Support** - PDF, JPG, PNG, TXT attachments  
✅ **AI Document Classification** - Automatically identifies T4, RL-1, and other document types  
✅ **Smart Data Extraction** - Extracts tax-relevant data using pattern matching  
✅ **Provincial Tax Support** - Specialized support for provincial tax slips (RL-1) and credits  
✅ **Automated Email Responses** - Sends processing results via email  
✅ **Security Features** - Secure document handling, no permanent storage  
✅ **Multi-Document Support** - Process multiple attachments per email  

## Supported Document Types

### Tax Slips
- 📄 **T4** - Statement of Remuneration Paid (Federal employment income)
- 📄 **RL-1** - Relevé 1 (Quebec employment income)
- 📄 **T4A** - Statement of Pension, Retirement, Annuity
- 📄 **RL-2** - Relevé 2 (Quebec benefits)

### Income Documents
- 🚗 **Uber/Lyft Summaries** - Weekly/monthly rideshare earnings
- 🚕 **Taxi Statements** - Cab driver income statements

### Expense Documents
- ⛽ **Gas Receipts** - Shell, Esso, Petro-Canada, etc.
- 🔧 **Maintenance Receipts** - Vehicle repairs, oil changes
- 🛡️ **Insurance Documents** - Vehicle insurance premiums
- 🅿️ **Parking Receipts** - Business parking expenses
- 📱 **Phone Bills** - Business use portion
- 🚗 **Vehicle Registration** - SAAQ fees

## Quick Start

### Prerequisites

1. AWS SES account configured (see [AWS_SES_SETUP.md](./AWS_SES_SETUP.md))
2. Node.js 18+ installed
3. Repository cloned locally

### Installation

```bash
# Install dependencies
npm install

# Run tests to verify installation
npm test
```

### Configuration

Create a `.env` file:

```env
# AWS SES Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-2
SES_FROM_DOMAIN=yourdomain.com

# Email Settings
TAXSYNC_FROM_EMAIL=notifications@yourdomain.com
```

### Start Server (for testing)

```bash
node email-server.js
```

The server will start on `http://localhost:3000`

## How It Works

### Email Processing Flow

```
1. User forwards email with tax document attachment
   ↓
2. AWS SES receives email and triggers processing
   ↓
3. Document is classified (T4, RL-1, receipt, etc.)
   ↓
4. Data is extracted using pattern matching
   ↓
5. Tax calculations are performed
   ↓
6. Results are sent back via email
```

### Document Classification

The system automatically identifies documents based on content:

```javascript
import { classifyDocument } from './document-automation.js';

const text = "Relevé 1 Case A: 60,000 QPP Case B.A: 3,500";
const result = classifyDocument(text);
// { type: 'RL1', confidence: 0.67 }
```

### Data Extraction

Extract structured data from documents:

```javascript
import { extractDocumentData } from './document-automation.js';

const text = "Case A: 60,000 Case B.A: 3,500";
const result = extractDocumentData(text, 'RL1');
// { success: true, data: { income: 60000, qpp: 3500 }, ... }
```

### Complete Processing

Process documents end-to-end:

```javascript
import { processDocument } from './document-automation.js';

const text = `Relevé 1
Employeur: ABC Inc.
Case A: 60,000
Case B.A: 3,500`;

const result = processDocument(text);
console.log(result);
// {
//   success: true,
//   type: 'RL1',
//   confidence: 0.67,
//   data: { income: 60000, qpp: 3500, employer: 'ABC Inc.' },
//   category: { category: 'employment_income', ... },
//   warnings: []
// }
```

## API Reference

### `classifyDocument(text)`

Classifies a document based on its content.

**Parameters:**
- `text` (string): Document text content

**Returns:**
```javascript
{
  type: 'T4' | 'RL1' | 'UBER_SUMMARY' | 'GAS_RECEIPT' | etc.,
  confidence: number // 0-1
}
```

### `extractDocumentData(text, docType)`

Extracts structured data from a document.

**Parameters:**
- `text` (string): Document text content
- `docType` (string): Document type from classification

**Returns:**
```javascript
{
  success: boolean,
  data: object,
  fieldsExtracted: number,
  totalFields: number
}
```

### `processDocument(text)`

End-to-end document processing.

**Parameters:**
- `text` (string): Document text content

**Returns:**
```javascript
{
  success: boolean,
  type: string,
  confidence: number,
  data: object,
  category: object,
  warnings: string[]
}
```

### `categorizeExpense(documentData)`

Categorizes and calculates tax implications.

**Parameters:**
- `documentData` (object): `{ type, data }`

**Returns:**
```javascript
{
  category: string,
  type: 'income' | 'expense',
  amount: number,
  deductibleAmount: number,
  taxSavings: string,
  description: string
}
```

## Example Usage

### Processing a T4 Slip

```javascript
const t4Text = `
  Statement of Remuneration Paid - T4
  Employer: TechCorp Inc.
  Box 14: 60,000.00
  Box 16: 3,166.45
  Box 18: 1,049.40
`;

const result = processDocument(t4Text);

if (result.success) {
  console.log(`Document type: ${result.type}`);
  console.log(`Employment income: $${result.data.income}`);
  console.log(`CPP contributions: $${result.data.cpp}`);
}
```

### Processing an RL-1 Slip

```javascript
const rl1Text = `
  Relevé 1 - RL-1
  Employeur: Services Financiers ABC Ltée
  Case A: 65,000
  Case B.A: 3,776.10
  Case H: 383.48
`;

const result = processDocument(rl1Text);

if (result.success) {
  console.log(`Document type: ${result.type}`);
  console.log(`Employment income: $${result.data.income}`);
  console.log(`QPP: $${result.data.qpp}`);
  console.log(`PPIP: $${result.data.ppip}`);
}
```

### Processing a Gas Receipt

```javascript
const receiptText = `
  Shell Canada
  Regular Gasoline
  Total: $65.43
  Date: 2025-01-15
`;

const result = processDocument(receiptText);

if (result.success) {
  console.log(`Expense type: ${result.category.category}`);
  console.log(`Amount: $${result.category.amount}`);
  console.log(`Tax savings: $${result.category.taxSavings}`);
}
```

## Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Expected output:
# ✔ tests 157
# ✔ pass 157
# ✔ fail 0
```

### Test Coverage

The document automation module has **87% code coverage** with tests for:
- Document classification (all types)
- Data extraction (T4, RL-1, receipts, etc.)
- Categorization and tax calculations
- Validation and error handling
- Integration scenarios

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel login
vercel

# Add environment variables
vercel env add AWS_ACCESS_KEY_ID
vercel env add AWS_SECRET_ACCESS_KEY
vercel env add AWS_REGION

# Deploy to production
vercel --prod
```

## Security

### Data Privacy

- ✅ Documents processed in memory only
- ✅ No permanent storage of document content
- ✅ Only extracted metadata retained
- ✅ AWS SES provides enterprise-grade email security

### Best Practices

- Use environment variables for credentials
- Enable TLS for email transmission
- Implement rate limiting
- Monitor for suspicious activity
- Validate all inputs
- Log security events

## Troubleshooting

### Document Not Classified

**Problem:** Document returns `type: 'UNKNOWN'`

**Solution:**
1. Check document contains expected keywords
2. Verify document format (not encrypted PDF)
3. Add debug logging to see matched patterns
4. Consider adding custom patterns for your document type

### Data Not Extracted

**Problem:** `fieldsExtracted: 0`

**Solution:**
1. Check regex patterns match your document format
2. Verify field names are spelled correctly
3. Test with sample data to isolate issue
4. Review extraction patterns in `DOCUMENT_PATTERNS`

### Low Confidence Score

**Problem:** Classification has low confidence

**Solution:**
1. Add more specific keywords to patterns
2. Improve document quality (clearer text)
3. Accept lower confidence for some document types
4. Manually verify results when confidence < 0.5

## Contributing

To add support for new document types:

1. Add patterns to `DOCUMENT_PATTERNS` in `document-automation.js`
2. Add extraction logic
3. Add categorization logic in `categorizeExpense()`
4. Add comprehensive tests
5. Update documentation

Example:

```javascript
// Add to DOCUMENT_PATTERNS
MY_DOCUMENT: {
  patterns: ['Keyword1', 'Keyword2'],
  extractors: {
    field1: /Pattern1[:\s]*([\d,]+\.?\d*)/i,
    field2: /Pattern2[:\s]*([A-Za-z\s]+)/i,
  },
},
```

## Support

For issues or questions:
- 📧 Email: support@taxsyncqc.com
- 🐛 Issues: [GitHub Issues](https://github.com/Isaloum/TaxFlowAI/issues)
- 📚 Documentation: This guide and AWS_SES_SETUP.md

## License

MIT License - See LICENSE file for details

---

**Ready to integrate? Start with [AWS_SES_SETUP.md](./AWS_SES_SETUP.md)** 🚀
