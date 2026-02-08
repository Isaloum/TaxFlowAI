# 📧 AWS SES Setup Guide - TaxFlowAI Email Automation

Complete guide to configure AWS Simple Email Service (SES) for email automation with TaxFlowAI.

## 📋 Overview

This guide will help you:
1. Create and configure an AWS account
2. Set up AWS SES for sending and receiving emails
3. Configure DNS records for email verification
4. Set up IAM credentials for API access
5. Configure email receiving rules (optional)
6. Test the complete email flow

**Time Required:** 30-45 minutes  
**Cost:** Free tier includes 3,000 emails/month (62,000 free for first 12 months if new AWS account)

---

## Part 1: AWS Account Setup

### Step 1: Create AWS Account

1. Go to [https://aws.amazon.com](https://aws.amazon.com)
2. Click **"Create an AWS Account"**
3. Fill in registration form:
   - **Email address:** Your business email
   - **AWS account name:** TaxFlowAI (or your preferred name)
   - **Password:** Strong password
4. Choose account type: **Personal** or **Professional**
5. Enter payment information (required even for free tier)
6. Verify identity via phone
7. Select **Basic Support (Free)**

### Step 2: Access AWS Console

1. Go to [https://console.aws.amazon.com](https://console.aws.amazon.com)
2. Sign in with your AWS account credentials
3. You'll see the AWS Management Console

---

## Part 2: AWS SES Configuration

### Step 1: Navigate to Amazon SES

1. In the AWS Console search bar, type **"SES"**
2. Click **Amazon Simple Email Service**
3. Select your preferred region (e.g., **us-east-1** or **us-east-2**)
   - Note: SES is not available in all regions
   - Recommended: **us-east-2** (Ohio) for North America

### Step 2: Verify Domain

1. In the SES Console, click **Verified identities** (left sidebar)
2. Click **Create identity**
3. Select **Domain**
4. Enter your domain name (e.g., `taxsyncqc.com` or `isaloumapps.com`)
5. Check ✅ **Assign a default configuration set** (optional)
6. Check ✅ **Use a custom MAIL FROM domain** (optional, recommended)
7. Check ✅ **Publish DNS records to Route 53** (if using AWS Route 53)
8. Click **Create identity**

**AWS will provide DNS records to add** - keep this page open!

### Step 3: Copy DNS Records

You'll see DNS records like:

**DKIM Records (3 CNAME records):**
```
Type: CNAME
Name: abc123._domainkey.taxsyncqc.com
Value: abc123.dkim.amazonses.com

Type: CNAME
Name: def456._domainkey.taxsyncqc.com
Value: def456.dkim.amazonses.com

Type: CNAME
Name: ghi789._domainkey.taxsyncqc.com
Value: ghi789.dkim.amazonses.com
```

**Verification Record (TXT):**
```
Type: TXT
Name: _amazonses.taxsyncqc.com
Value: [long verification string]
```

**MX Records (for receiving - optional):**
```
Type: MX
Name: taxsyncqc.com
Priority: 10
Value: inbound-smtp.us-east-2.amazonaws.com
```

---

## Part 3: DNS Configuration

### Where to Add DNS Records

Add these records at your **domain registrar** or **DNS provider**:

- **Namecheap**: Domain List → Manage → Advanced DNS
- **GoDaddy**: My Products → Domains → DNS
- **Cloudflare**: Select domain → DNS → Records
- **Google Domains**: My domains → DNS
- **Route 53**: If using AWS Route 53, records may be auto-added

### Step-by-Step DNS Record Addition

#### Example: Cloudflare

1. Log in to Cloudflare
2. Select your domain (e.g., `taxsyncqc.com`)
3. Click **DNS** in sidebar
4. For each DKIM record:
   - Click **Add record**
   - Type: **CNAME**
   - Name: `abc123._domainkey` (copy from AWS SES)
   - Target: `abc123.dkim.amazonses.com`
   - Proxy status: **DNS only** (grey cloud)
   - TTL: **Auto**
   - Click **Save**

5. Add verification TXT record:
   - Click **Add record**
   - Type: **TXT**
   - Name: `_amazonses`
   - Content: [paste verification string from AWS]
   - TTL: **Auto**
   - Click **Save**

6. Add MX records (if receiving emails):
   - Click **Add record**
   - Type: **MX**
   - Name: `@` (or your domain)
   - Mail server: `inbound-smtp.us-east-2.amazonaws.com`
   - Priority: **10**
   - TTL: **Auto**
   - Click **Save**

### DNS Propagation

⏱️ **Wait Time:** 5-60 minutes (usually ~10 minutes)

Check propagation:
```bash
# Check DKIM records
dig CNAME abc123._domainkey.taxsyncqc.com

# Check verification TXT record
dig TXT _amazonses.taxsyncqc.com

# Check MX records
dig MX taxsyncqc.com
```

Or use online tools:
- [DNS Checker](https://dnschecker.org)
- [MXToolbox](https://mxtoolbox.com)

---

## Part 4: Domain Verification

### Step 1: Verify DNS in AWS SES

1. Go back to SES Console → **Verified identities**
2. Click on your domain name
3. Wait for DNS propagation (refresh page every few minutes)
4. Status should change from **Pending verification** to **Verified**

### Step 2: Check Verification Status

You should see:
```
✅ Domain: Verified
✅ DKIM: Successful
✅ Custom MAIL FROM: Verified (if configured)
```

If verification fails:
- Wait longer for DNS propagation (up to 72 hours)
- Double-check DNS records match exactly
- Ensure no typos in record values

---

## Part 5: Verify Email Address (For Sandbox Testing)

While in SES Sandbox mode, you can only send to verified email addresses.

### Step 1: Verify Sender Email

1. In SES Console, click **Verified identities**
2. Click **Create identity**
3. Select **Email address**
4. Enter: `notifications@taxsyncqc.com` (or your domain)
5. Click **Create identity**
6. Check your inbox and click verification link

### Step 2: Verify Test Recipient Emails

For testing, verify your personal email:
1. Click **Create identity** again
2. Select **Email address**
3. Enter your test email (e.g., `yourname@gmail.com`)
4. Click **Create identity**
5. Check inbox and verify

---

## Part 6: IAM User and API Credentials

### Step 1: Create IAM User for SES

1. In AWS Console search bar, type **"IAM"**
2. Click **Identity and Access Management**
3. Click **Users** (left sidebar)
4. Click **Create user**
5. User name: `taxsyncqc-ses-user`
6. Click **Next**

### Step 2: Attach SES Permissions

1. Select **Attach policies directly**
2. Search for and select: **AmazonSESFullAccess**
   - Or create custom policy with minimal permissions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "ses:SendEmail",
           "ses:SendRawEmail"
         ],
         "Resource": "*"
       }
     ]
   }
   ```
3. Click **Next**
4. Click **Create user**

### Step 3: Create Access Keys

1. Click on the newly created user (`taxsyncqc-ses-user`)
2. Click **Security credentials** tab
3. Scroll to **Access keys** section
4. Click **Create access key**
5. Select use case: **Application running outside AWS**
6. Click **Next**
7. Add description (optional): "TaxFlowAI Email Automation"
8. Click **Create access key**

### Step 4: Save Credentials

**⚠️ CRITICAL: Save these credentials immediately - you won't see them again!**

```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-2
SES_FROM_DOMAIN=taxsyncqc.com
```

Download the `.csv` file or copy to your password manager.

---

## Part 7: Request Production Access

By default, SES starts in **Sandbox mode**:
- ✅ Can send to verified email addresses only
- ✅ Limited to 200 emails/day
- ❌ Cannot send to arbitrary recipients

### Step 1: Submit Request

1. In SES Console, click **Account dashboard** (left sidebar)
2. Look for **Sending statistics** section
3. Click **Request production access** button
4. Fill out the form:

**Use Case Details:**
```
Use case description:
TaxFlowAI is a Canadian tax calculator that sends automated email 
notifications to users after processing their tax documents. 
Users forward tax documents (T4, RL-1) to our system, and we send 
back processed results with tax estimates.

Website URL: https://isaloum.github.io/TaxFlowAI/

Email sending process:
- Users explicitly opt-in by sending emails to our system
- We send confirmation emails with tax calculation results
- All emails are transactional (no marketing)
- We maintain a suppression list for bounces/complaints

Bounce/complaint handling:
- We monitor SES bounce and complaint notifications
- We automatically suppress emails that bounce
- We provide unsubscribe links in all emails
```

**Sending Quota:**
- Daily sending quota: 10,000 (or your expected volume)
- Sending rate: 10 emails/second

### Step 2: Wait for Approval

- AWS typically responds within 24-48 hours
- Check your email for approval notification
- Once approved, you can send to any email address

### Alternative: Stay in Sandbox

For testing and demos, you can stay in Sandbox mode:
- Verify all recipient emails beforehand
- Good for development and small-scale testing
- No approval needed

---

## Part 8: Configure Email Receiving (Optional)

If you want to receive emails via SES:

### Step 1: Create Receipt Rule Set

1. In SES Console, click **Email receiving** → **Rule sets**
2. Click **Create rule set**
3. Rule set name: `taxflowai-rules`
4. Click **Create rule set**
5. Click **Set as active rule set**

### Step 2: Create Receipt Rule

1. Click **Create rule**
2. Add recipient: `notifications@taxsyncqc.com`
3. Click **Next**

### Step 3: Add Actions

Choose action(s) for incoming emails:

**Option A: Forward to SNS Topic (for webhook)**
1. Add action: **Publish to Amazon SNS topic**
2. Create new SNS topic: `taxflowai-email-incoming`
3. Click **Next**

**Option B: Store in S3 (for processing)**
1. Add action: **Deliver to Amazon S3 bucket**
2. Create or select S3 bucket
3. Object key prefix: `incoming-emails/`

**Option C: Invoke Lambda (for serverless processing)**
1. Add action: **Invoke AWS Lambda function**
2. Create or select Lambda function
3. (Requires setting up Lambda function first)

### Step 4: Finalize Rule

1. Rule name: `process-tax-documents`
2. Enable rule: **Yes**
3. Require TLS: **Yes** (recommended)
4. Enable spam and virus scanning: **Yes** (recommended)
5. Click **Create rule**

---

## Part 9: Testing Email Flow

### Test 1: Send Test Email via AWS Console

1. In SES Console, go to **Verified identities**
2. Click on your email address
3. Click **Send test email**
4. Configure test:
   - Scenario: **Custom**
   - From: `notifications@taxsyncqc.com`
   - To: Your verified email
   - Subject: `Test from TaxFlowAI`
   - Body: `This is a test email`
5. Click **Send test email**
6. Check your inbox

### Test 2: Send via AWS CLI

```bash
aws ses send-email \
  --from notifications@taxsyncqc.com \
  --to yourname@gmail.com \
  --subject "TaxFlowAI Test" \
  --text "This is a test email from TaxFlowAI" \
  --region us-east-2
```

### Test 3: Send via SDK (Node.js)

```javascript
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({ region: 'us-east-2' });

const params = {
  Source: 'notifications@taxsyncqc.com',
  Destination: {
    ToAddresses: ['yourname@gmail.com'],
  },
  Message: {
    Subject: { Data: 'TaxFlowAI Test' },
    Body: { Text: { Data: 'Test email from TaxFlowAI' } },
  },
};

await ses.send(new SendEmailCommand(params));
console.log('Email sent successfully!');
```

---

## Part 10: Monitoring & Maintenance

### Check Sending Statistics

1. In SES Console, go to **Account dashboard**
2. View metrics:
   - Emails sent (24h)
   - Bounces
   - Complaints
   - Sending quota usage

### Set Up CloudWatch Alarms (Optional)

1. Go to CloudWatch Console
2. Create alarms for:
   - High bounce rate (> 5%)
   - High complaint rate (> 0.1%)
   - Approaching sending quota

### Monitor Bounce and Complaint Rates

**⚠️ Important:** AWS will suspend your account if:
- Bounce rate > 5%
- Complaint rate > 0.1%

**Best practices:**
- Validate email addresses before sending
- Remove bounced emails from your list
- Provide clear unsubscribe options
- Only send to opted-in recipients

---

## Environment Variables Summary

Add these to your `.env` file:

```env
# AWS SES Configuration
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_REGION=us-east-2

# Email Configuration
SES_FROM_DOMAIN=taxsyncqc.com
TAXSYNC_FROM_EMAIL=notifications@taxsyncqc.com
TAXSYNCAI_FROM_EMAIL=ai-alerts@taxsyncqc.com

# Application Settings
PORT=3000
NODE_ENV=production
```

---

## Troubleshooting

### Issue 1: Domain Not Verifying

**Symptoms:** Domain stays in "Pending verification" status

**Solution:**
1. Wait 10-60 minutes for DNS propagation
2. Double-check DNS records match AWS exactly
3. Use DNS checker tools to verify records are live
4. Check for typos in TXT record value
5. Ensure no conflicting DNS records

### Issue 2: Cannot Send Emails (Access Denied)

**Symptoms:** Error: "Email address not verified"

**Solution:**
- In Sandbox mode: Verify both sender and recipient emails
- Request production access to send to any email

### Issue 3: Emails Going to Spam

**Symptoms:** Emails land in spam folder

**Solution:**
1. Ensure DKIM is configured (3 CNAME records)
2. Add SPF record to DNS:
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:amazonses.com ~all
   ```
3. Configure DMARC record:
   ```
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:dmarc@taxsyncqc.com
   ```
4. Use professional email content (avoid spam trigger words)
5. Warm up your domain by gradually increasing sending volume

### Issue 4: High Bounce Rate

**Symptoms:** AWS warns about bounce rate

**Solution:**
- Validate email addresses before sending
- Remove invalid emails from your list
- Use double opt-in for subscriptions
- Monitor bounce notifications via SNS

### Issue 5: API Credentials Not Working

**Symptoms:** Authentication errors

**Solution:**
1. Verify Access Key ID and Secret Key are correct
2. Check IAM user has SES permissions
3. Ensure AWS region matches your SES region
4. Rotate keys if compromised

---

## Security Best Practices

### Credential Security

- ✅ Store credentials in environment variables only
- ✅ Never commit keys to Git
- ✅ Use IAM roles when possible (for EC2/Lambda)
- ✅ Rotate access keys every 90 days
- ✅ Use least privilege permissions

### Email Security

- ✅ Enable DKIM signing
- ✅ Configure SPF and DMARC
- ✅ Require TLS for transmission
- ✅ Enable spam and virus scanning
- ✅ Monitor bounce and complaint rates
- ✅ Implement rate limiting in your application

### Domain Security

- ✅ Use verified domains only
- ✅ Don't allow user-controlled "From" addresses
- ✅ Validate recipient emails
- ✅ Implement suppression lists
- ✅ Log all email sending activity

---

## Cost Estimation

### SES Pricing (as of 2025)

**Free Tier:**
- First 62,000 emails/month free (first 12 months for new AWS accounts)
- After free tier: 3,000 emails/month free (permanent)

**Paid Tier:**
- $0.10 per 1,000 emails sent
- $0.12 per GB of attachments

**Example Costs:**
- 10,000 emails/month: **Free** (within free tier)
- 100,000 emails/month: ~$10/month
- 1,000,000 emails/month: ~$100/month

**Data Transfer:**
- Outbound data to internet: $0.09/GB (first 10 GB/month free)

---

## Next Steps

After completing SES setup:

1. ✅ Test email sending with sample documents
2. ✅ Deploy your application (see [DEPLOYMENT.md](./DEPLOYMENT.md))
3. ✅ Set up monitoring and alerts
4. ✅ Configure email templates
5. ✅ Implement bounce/complaint handling
6. ✅ Request production access (if needed)

---

## Support Resources

**AWS SES Documentation:**
- Official Docs: https://docs.aws.amazon.com/ses/
- Developer Guide: https://docs.aws.amazon.com/ses/latest/dg/
- API Reference: https://docs.aws.amazon.com/ses/latest/APIReference/

**AWS Support:**
- Free tier support: Forums & documentation
- Paid support plans: https://aws.amazon.com/premiumsupport/

**TaxFlowAI Support:**
- Email: support@taxsyncqc.com
- GitHub Issues: https://github.com/Isaloum/TaxFlowAI/issues

---

**Setup complete? Proceed to deployment: [DEPLOYMENT.md](./DEPLOYMENT.md)** 🚀
