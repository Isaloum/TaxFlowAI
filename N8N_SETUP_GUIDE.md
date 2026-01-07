# n8n Integration Setup Guide for TaxSyncQC

## Overview

TaxSyncQC can connect to an n8n workflow to automatically parse RL-1 and T4 tax slips from pasted email text. This guide shows you how to set up the integration.

## What You'll Need

1. An n8n instance (cloud or self-hosted)
2. The TaxSyncQC web app (already built!)
3. 5-10 minutes to set up the workflow

## Step 1: Import the n8n Workflow

### Option A: Import from JSON File

1. Log into your n8n instance
2. Click **"Workflows"** in the left sidebar
3. Click **"Import from File"** (or the import button)
4. Select the file: `n8n-workflow-example.json`
5. Click **"Import"**

### Option B: Create Manually

If you prefer to create the workflow manually:

1. Create a new workflow in n8n
2. Add these nodes:

#### Node 1: Webhook Trigger
- **Type**: Webhook
- **HTTP Method**: POST
- **Path**: `parse-tax-slip` (or your preferred path)
- **Response Mode**: "Using 'Respond to Webhook' Node"

#### Node 2: Code Node (Parse Tax Slip)
- **Type**: Code
- **Mode**: Run Once for All Items
- Paste the JavaScript code from below (see "Parser Code" section)

#### Node 3: Respond to Webhook
- **Type**: Respond to Webhook
- **Response**: JSON
- **Add Headers**:
  - `Content-Type`: `application/json`
  - `Access-Control-Allow-Origin`: `*` (enables CORS)

## Step 2: Activate the Workflow

1. Click the **"Activate"** toggle in the top right
2. Copy the webhook URL (it will look like):
   ```
   https://your-n8n-instance.com/webhook/parse-tax-slip
   ```

## Step 3: Configure TaxSyncQC

1. Open `index.html` in your browser
2. Scroll to the **"🔗 Connect to n8n"** section
3. Paste your webhook URL
4. The URL is automatically saved to localStorage

## Step 4: Test the Integration

### Manual Test

1. Paste this sample RL-1 text into the text area:
   ```
   Relevé 1 (RL-1) - 2025
   Case A: 60 000 $
   Case F: 400 $
   Case B.A: 3 200 $
   ```

2. Click **"🚀 Send to n8n"**

3. You should see parsed fields appear

4. Click **"⬇️ Apply parsed fields"**

5. The form should auto-fill with:
   - Box A: 60000
   - Box F: 400

### Auto-Parse Test

1. Check **"Enable auto-parse on paste/drop"**
2. Copy and paste any tax slip text
3. The webhook is called automatically
4. Fields are applied automatically

## Expected Response Format

Your n8n workflow should return JSON in this format:

```json
{
  "rl1": {
    "A": 60000,
    "F": 400,
    "B.A": 3200
  },
  "t4": {
    "14": 60000,
    "44": 400,
    "16": 3500
  },
  "rrsp": 5000,
  "slipType": "both",
  "success": true
}
```

### Field Mapping

**RL-1 (Quebec) Fields:**
- `A`: Employment income (Line 101)
- `F`: Union dues (Line 397.1)
- `B.A`: QPP contributions
- `H`: Source deductions (Quebec)
- `D`: Income tax withheld
- `N`: Tips
- `J`: Commissions
- `K`: Vacation pay
- `L`: Travel expenses
- `M`: Other benefits

**T4 (Federal) Fields:**
- `14`: Employment income
- `44`: Union dues
- `16`: Employee's CPP contributions
- `17`: Employee's QPP contributions
- `18`: EI premiums
- `20`: RPP contributions
- `55`: CPP/QPP pensionable earnings
- `52`: Pension adjustment
- `46`: Charitable donations

**RRSP:**
- `rrsp`: RRSP contribution amount (optional suggestion)

## Parser Code

The workflow includes a JavaScript parser that extracts values from pasted text. Here's what it does:

### Supported Input Formats

The parser recognizes multiple formats:

**French:**
```
Case A: 60 000 $
Cotisations syndicales: 400 $
REER: 5 000 $
```

**English:**
```
Box A: 60,000
Union dues: 400
RRSP: 5,000
```

**Mixed:**
```
RL-1 Slip
Employment income (Box A): $60,000
Case F (Union dues): 400$
```

### Extraction Patterns

The parser uses regex patterns to find:
- Money amounts with or without commas
- French and English labels
- Case/Box numbers
- Dollar signs before or after amounts

### Custom Parser Modifications

To add more fields, modify the `rl1Patterns` or `t4Patterns` objects in the Code node:

```javascript
const rl1Patterns = {
  'YOUR_FIELD': [
    /Your\\s*pattern[:\\s]*([\\d,\\.\\s]+)/i,
    /Alternative\\s*pattern[:\\s]*([\\d,\\.\\s]+)/i
  ]
};
```

## Troubleshooting

### "Could not reach the n8n webhook"

- ✅ Check that the workflow is **activated** (toggle in top right)
- ✅ Verify the webhook URL is correct
- ✅ Make sure your n8n instance is accessible from your browser
- ✅ Check browser console for CORS errors

### "Webhook response was missing RL-1/T4/RRSP fields"

- ✅ Test the webhook directly with curl:
  ```bash
  curl -X POST https://your-n8n.com/webhook/parse-tax-slip \
    -H "Content-Type: application/json" \
    -d '{"text":"Case A: 60000", "lang":"fr"}'
  ```
- ✅ Check the n8n workflow execution log
- ✅ Verify the Code node is returning the correct format

### CORS Issues

If you get CORS errors, make sure the "Respond to Webhook" node includes:

```
Access-Control-Allow-Origin: *
```

Or for production, use your specific domain:

```
Access-Control-Allow-Origin: https://yourdomain.com
```

## Advanced: Email Integration

You can extend the n8n workflow to parse emails automatically:

1. Add an **Email Trigger** node (IMAP)
2. Connect it to the parser
3. Extract email body text
4. Store results in a database
5. Send notifications when new slips arrive

### Example Email Workflow

```
Email Trigger (IMAP)
  → Extract Email Body
  → Parse Tax Slip
  → Store in Airtable/Database
  → Send Notification (Slack/Discord)
```

## Security Considerations

### For Production Use:

1. **Use HTTPS**: Always use HTTPS for your n8n instance
2. **Add Authentication**: Consider adding basic auth to the webhook
3. **Rate Limiting**: Add rate limiting to prevent abuse
4. **Validate Input**: The parser should validate and sanitize inputs
5. **No PII Logging**: Don't log SIN or other personal information

### Example with Basic Auth:

In n8n, add an **IF** node after the webhook:

```javascript
// Check for valid API key
const apiKey = $input.item.json.headers['x-api-key'];
return apiKey === 'your-secret-key';
```

Then in TaxSyncQC, modify the fetch call to include the header.

## Example Use Cases

### 1. **Individual Tax Filer**
- Paste tax slip text from email
- Auto-fill the calculator
- Estimate credits instantly

### 2. **Tax Preparation Service**
- Clients email their slips
- n8n parses and stores in database
- Bulk processing for multiple clients

### 3. **Payroll Department**
- Test payroll calculations
- Verify tax withholdings
- Provide estimates to employees

## Testing with Sample Data

### RL-1 Sample (Quebec):
```
RELEVÉ 1 - REVENUS D'EMPLOI 2025

Employeur: ABC Company Inc.
NAS: 123-456-789

Case A - Revenus d'emploi: 60 000,00 $
Case B.A - Cotisations RRQ: 3 200,50 $
Case F - Cotisations syndicales: 425,00 $
Case H - Impôt du Québec retenu: 8 500,00 $
```

Expected result:
```json
{
  "rl1": {
    "A": 60000,
    "B.A": 3200.50,
    "F": 425,
    "H": 8500
  }
}
```

### T4 Sample (Federal):
```
STATEMENT OF REMUNERATION PAID - T4 2025

Box 14 - Employment income: $60,000.00
Box 16 - Employee's CPP contributions: $3,500.00
Box 44 - Union dues: $425.00
Box 55 - CPP/QPP pensionable earnings: $60,000.00
```

Expected result:
```json
{
  "t4": {
    "14": 60000,
    "16": 3500,
    "44": 425,
    "55": 60000
  }
}
```

## Support

For issues with:
- **TaxSyncQC**: Check the GitHub repository
- **n8n**: Visit n8n.io/docs or the n8n community forum
- **This integration**: Review the console logs in your browser (F12)

## License

This n8n workflow is provided as-is under the same license as TaxSyncQC.

---

**Ready to go!** Your TaxSyncQC app now has intelligent tax slip parsing powered by n8n! 🎉
