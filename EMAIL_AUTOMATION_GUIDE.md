# Email Automation Guide for TaxSyncQC

## 🎯 Goal: Fully Automated Tax Slip Processing

When someone emails you their tax slip, this workflow will:
1. ✅ Detect the email automatically
2. ✅ Extract RL-1 or T4 data
3. ✅ Store the results
4. ✅ Send confirmation email
5. ✅ Notify you (Slack/Discord/etc.)

---

## 📋 Setup Options

### Option 1: Simple Email Monitoring (Easiest)

**Best for:** Personal use, monitoring your own email

1. **Email Provider Setup:**
   - Gmail: Enable IMAP in settings
   - Outlook: Enable IMAP
   - Custom: Get IMAP credentials

2. **n8n Setup:**
   - Use "IMAP Email" trigger node
   - Checks inbox every minute
   - Filters for tax-related emails

---

### Option 2: Dedicated Email Address (Recommended)

**Best for:** Business use, multiple clients

1. **Create a dedicated email:**
   ```
   taxslips@yourdomain.com
   ```

2. **Set up email forwarding:**
   - Clients send to this address
   - Or forward from your main email

3. **n8n monitors this inbox**

---

### Option 3: Email Parser Service (Advanced)

**Best for:** High volume, complex parsing

Use services like:
- Mailparser.io
- Zapier Email Parser
- ParseMail

---

## 🚀 Quick Setup (Gmail Example)

### Step 1: Enable Gmail IMAP

1. Go to Gmail Settings → "Forwarding and POP/IMAP"
2. Enable IMAP
3. Create an App Password:
   - Google Account → Security
   - 2-Step Verification → App passwords
   - Generate password for "Mail"

### Step 2: Import Workflow to n8n

1. Download `n8n-email-workflow.json` from your repo
2. In n8n cloud: Workflows → Import from File
3. Upload the file

### Step 3: Configure Email Credentials

1. Click on "Email Trigger (IMAP)" node
2. Add credentials:
   - **Host:** imap.gmail.com
   - **Port:** 993
   - **User:** your-email@gmail.com
   - **Password:** [Your App Password]
   - **SSL/TLS:** Enabled

### Step 4: Configure Email Filter

The workflow filters emails containing:
- "RL-1" in subject
- "T4" in subject
- "Tax slip" in subject

You can customize this in the "Filter Tax Emails" node.

### Step 5: Choose Storage Option

Pick ONE of these:

#### A) Airtable (Recommended - Easy & Visual)

1. Sign up at airtable.com (free)
2. Create a base called "TaxSyncQC"
3. Create a table with columns:
   - Email From (text)
   - Subject (text)
   - Date Received (date)
   - Slip Type (single select: RL-1, T4, Both)
   - Income (number)
   - Union Dues (number)
   - RRSP (number)
   - Status (single select: Parsed, Processed, Error)

4. In n8n, configure "Save to Airtable" node

#### B) Google Sheets (Simple)

Replace "Save to Airtable" node with "Google Sheets" node:
- Add row to spreadsheet
- Map the fields

#### C) Database (Advanced)

Replace with MySQL/PostgreSQL/MongoDB node

#### D) Skip Storage (Just Notifications)

Delete the "Save to Airtable" node

### Step 6: Configure Notifications

Pick what you want:

#### Email Notification (Built-in)

Configure "Send Confirmation Email" node:
- SMTP server (Gmail, SendGrid, etc.)
- From address
- Customize message

#### Slack Notification

1. Create Slack workspace
2. Create webhook URL
3. Configure "Send Slack Notification" node

#### Discord Notification

Replace Slack node with Discord webhook:
```javascript
POST https://discord.com/api/webhooks/YOUR_WEBHOOK_ID
{
  "content": "New tax slip processed!"
}
```

### Step 7: Activate the Workflow

1. Click the toggle in top right → GREEN
2. Send yourself a test email!

---

## 📧 Test Email Templates

### Test Email 1: RL-1 Quebec

**Subject:** My RL-1 Tax Slip 2025

**Body:**
```
Hi,

Here's my RL-1 for 2025:

Case A - Revenus d'emploi: 60,000.00 $
Case F - Cotisations syndicales: 425.00 $
Case B.A - Cotisations RRQ: 3,200.50 $

REER: 5,000 $

Thanks!
```

### Test Email 2: T4 Federal

**Subject:** T4 Slip - Please Process

**Body:**
```
Please find my T4 below:

Box 14 - Employment income: $60,000.00
Box 44 - Union dues: $425.00
Box 16 - Employee's CPP contributions: $3,500.00

RRSP contribution: $5,000

Thank you
```

---

## 🔧 Advanced Features

### 1. PDF Attachment Processing

Add a node to extract text from PDF attachments:

```javascript
// After email trigger, add:
const attachments = $input.item.json.attachments || [];
const pdfAttachment = attachments.find(a => a.type === 'application/pdf');

if (pdfAttachment) {
  // Use PDF extraction node or service
  const pdfText = await extractPDFText(pdfAttachment);
  return { emailBody: pdfText };
}
```

### 2. OCR for Scanned Documents

Integrate with:
- Google Cloud Vision API
- AWS Textract
- Azure Computer Vision

### 3. Smart Income Detection

Add AI to detect income amounts:

```javascript
// Use OpenAI or Claude API
const prompt = `Extract income, union dues, and RRSP from this text: ${emailBody}`;
const response = await callAI(prompt);
```

### 4. Auto-Calculate and Email Results

Add a calculation node:

```javascript
// After parsing, calculate credits
const income = rl1?.A || t4?.['14'] || 0;
const rrsp = rrspAmount || 0;

// Call TaxSyncQC calculation API (you'd need to create this)
// Or duplicate the calculation logic here

const solidarityCredit = calculateSolidarityCredit(income);
const workPremium = calculateWorkPremium(income);
// etc.

// Email the results back to the user
```

---

## 🎨 Workflow Diagram

```
📧 Email Arrives
  ↓
🔍 Filter (RL-1/T4 keywords)
  ↓
📄 Extract Email Body
  ↓
🤖 Parse Tax Slip Data
  ↓
✅ Check Parsing Success
  ↓
┌──────────────────────────────┐
│ 💾 Save to Database          │
│ ✉️  Send Confirmation Email  │
│ 📱 Slack/Discord Notification│
└──────────────────────────────┘
```

---

## 🔐 Security Best Practices

### 1. Use App-Specific Passwords
Never use your main email password in n8n.

### 2. Limit Email Access
Create a dedicated email account for tax slips only.

### 3. Encrypt Sensitive Data
- Use n8n's credential encryption
- Don't log SIN or personal info
- Set up data retention policies

### 4. Access Control
- Limit who can access the n8n workflow
- Use n8n team permissions
- Enable 2FA on n8n account

### 5. GDPR Compliance
- Add consent checkbox on your site
- Provide data deletion option
- Document data retention policy

---

## 🐛 Troubleshooting

### Email Not Being Received

**Check:**
- ✅ IMAP is enabled
- ✅ Credentials are correct
- ✅ Firewall allows IMAP (port 993)
- ✅ Email filter is correct

**Test:**
- Click "Execute Workflow" manually
- Check n8n execution log
- Verify inbox has matching emails

### Parsing Not Working

**Check:**
- ✅ Email body contains recognizable patterns
- ✅ Numbers are in expected format
- ✅ Parser regex patterns match your format

**Debug:**
- Add a "Set" node to see raw email body
- Test parser with sample text
- Check regex patterns

### Database Not Saving

**Check:**
- ✅ Database credentials are correct
- ✅ Table/columns exist
- ✅ Field mapping is correct

---

## 💡 Use Cases

### Personal Use
- Automatically process your own tax slips
- Get notifications when slips arrive
- Track year-over-year income

### Accounting Firm
- Clients email their slips
- Auto-extract and store data
- Assign to accountants for review
- Send estimates automatically

### Payroll Department
- Employees forward their slips
- Verify payroll accuracy
- Provide instant credit estimates

### Tax Preparation Service
- Public email for tax slip submission
- Auto-parse and categorize
- Queue for professional review

---

## 📊 Sample Airtable Base Structure

**Base Name:** TaxSyncQC

**Table 1: Tax Slips**
| Field | Type | Description |
|-------|------|-------------|
| Email From | Email | Client email |
| Subject | Text | Email subject |
| Date Received | Date | When received |
| Slip Type | Select | RL-1, T4, Both |
| Income | Number | Employment income |
| Union Dues | Number | Union dues |
| RRSP | Number | RRSP contribution |
| Status | Select | Parsed, Reviewed, Processed |
| Notes | Long text | Manual notes |
| Assigned To | User | Team member |

**Table 2: Calculations**
(Link to Tax Slips table)
| Field | Type |
|-------|------|
| Tax Slip | Link |
| Solidarity Credit | Number |
| Work Premium | Number |
| CWB | Number |
| Total Benefit | Formula |
| Sent to Client | Checkbox |

---

## 🎓 Next Steps

1. **Start Simple:**
   - Set up basic email monitoring
   - Test with your own email
   - Verify parsing works

2. **Add Storage:**
   - Connect Airtable or Sheets
   - Verify data is saved correctly

3. **Add Notifications:**
   - Set up email confirmations
   - Add Slack/Discord if desired

4. **Scale Up:**
   - Add PDF processing
   - Integrate calculations
   - Create client dashboard

---

## 📞 Support

**Questions?**
- Check n8n documentation: https://docs.n8n.io
- n8n community forum: https://community.n8n.io
- TaxSyncQC issues: https://github.com/Isaloum/TaxSyncQC/issues

**Need Help?**
Share your:
- n8n workflow screenshot
- Error messages
- Sample email (with personal info removed)

---

**Ready to automate? Import `n8n-email-workflow.json` and let's go!** 🚀
