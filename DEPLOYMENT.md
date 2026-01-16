# 🚀 Deployment Guide - TaxSyncQC Email Automation System

Complete guide for deploying the email automation system to production for TaxSyncQC.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Deployment Options](#deployment-options)
- [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
- [Railway Deployment](#railway-deployment)
- [Render Deployment](#render-deployment)
- [Docker Deployment](#docker-deployment)
- [AWS SES Configuration](#aws-ses-configuration)
- [DNS Setup](#dns-setup)
- [Environment Variables](#environment-variables)
- [Testing & Validation](#testing--validation)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

✅ **Required Accounts:**
- [AWS](https://aws.amazon.com) account with SES access
- Domain access for your TaxSyncQC domain
- Deployment platform account (Vercel/Railway/Render)

✅ **Required Tools:**
- Node.js 18+ installed locally
- Git installed
- npm or yarn package manager

✅ **Repository Access:**
- Clone this repository locally
- Ensure all tests pass: `npm test` (should show 157 passing tests)

---

## Deployment Options

| Platform | Best For | Pros | Cons |
|----------|----------|------|------|
| **Vercel** | Serverless deployment | Free tier, auto-scaling, easy setup | Cold starts on free tier |
| **Railway** | Persistent server | Always warm, simple config | Paid after free tier |
| **Render** | Alternative hosting | Good free tier, Docker support | Slower deploys |
| **Docker** | Self-hosting | Full control, any platform | Requires infrastructure |

---

## Vercel Deployment (Recommended)

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy

```bash
# From repository root
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? [Select your account]
# - Link to existing project? No
# - Project name? taxsyncqc-email-automation
# - Directory? ./
# - Override settings? No
```

### 4. Configure Environment Variables

```bash
# Add environment variables
vercel env add AWS_ACCESS_KEY_ID
# Paste your AWS access key ID when prompted

vercel env add AWS_SECRET_ACCESS_KEY
# Paste your AWS secret access key when prompted

vercel env add AWS_REGION
# Enter: us-east-2

vercel env add SES_FROM_DOMAIN
# Enter: your-domain.com

vercel env add NODE_ENV
# Enter: production
```

Or add via Vercel Dashboard:
1. Go to your project at https://vercel.com/dashboard
2. Settings → Environment Variables
3. Add each variable for Production, Preview, and Development

### 5. Deploy to Production

```bash
vercel --prod
```

### 6. Get Your Deployment URL

```bash
# Your app will be available at:
# https://taxsyncqc-email-automation.vercel.app
# or your custom domain
```

### 7. Configure Custom Domain (Optional)

1. In Vercel Dashboard → Settings → Domains
2. Add domain: `email.taxsyncqc.com`
3. Follow DNS configuration instructions

---

## Railway Deployment

### 1. Install Railway CLI

```bash
npm install -g @railway/cli
```

### 2. Login to Railway

```bash
railway login
```

### 3. Initialize Project

```bash
# From repository root
railway init

# Project name: taxsyncqc-email-automation
```

### 4. Add Environment Variables

```bash
railway variables set AWS_ACCESS_KEY_ID="your_access_key_id_here"
railway variables set AWS_SECRET_ACCESS_KEY="your_secret_access_key_here"
railway variables set AWS_REGION="us-east-2"
railway variables set SES_FROM_DOMAIN="your-domain.com"
railway variables set NODE_ENV="production"
railway variables set PORT="3000"
```

### 5. Deploy

```bash
railway up
```

### 6. Get Deployment URL

```bash
railway domain
# Creates a public domain: taxsyncqc-email-automation.up.railway.app
```

### 7. Monitor Logs

```bash
railway logs
```

---

## Render Deployment

### 1. Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: taxsyncqc-email-automation
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node email-server.js`
   - **Instance Type**: Free

### 2. Add Environment Variables

In the Render Dashboard, add these environment variables:

```
AWS_ACCESS_KEY_ID = your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY = your_aws_secret_access_key_here
AWS_REGION = us-east-2
SES_FROM_DOMAIN = your-domain.com
NODE_ENV = production
PORT = 3000
```

### 3. Deploy

Click "Create Web Service" - Render will automatically deploy.

### 4. Get Deployment URL

Your service will be available at:
```
https://taxsyncqc-email-automation.onrender.com
```

### 5. Configure Health Check

- Health Check Path: `/health`
- Auto-Deploy: Yes

---

## Docker Deployment

### 1. Build Docker Image

Create a `Dockerfile` in your project root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "email-server.js"]
```

Build the image:

```bash
docker build -t taxsyncqc-email-automation .
```

### 2. Run Locally (Testing)

```bash
# Create .env file with your configuration
cp .env.example .env
# Edit .env with your actual credentials

# Run container
docker run -d \
  --name taxsyncqc-email \
  -p 3000:3000 \
  --env-file .env \
  taxsyncqc-email-automation

# Check logs
docker logs taxsyncqc-email

# Test health endpoint
curl http://localhost:3000/health
```

### 3. Deploy to Cloud Platform

#### AWS ECS:
```bash
# Tag for ECR
docker tag taxsyncqc-email-automation:latest \
  <account-id>.dkr.ecr.us-east-1.amazonaws.com/taxsyncqc-email-automation:latest

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/taxsyncqc-email-automation:latest
```

#### Google Cloud Run:
```bash
# Tag for GCR
docker tag taxsyncqc-email-automation gcr.io/<project-id>/taxsyncqc-email-automation

# Push to GCR
docker push gcr.io/<project-id>/taxsyncqc-email-automation

# Deploy to Cloud Run
gcloud run deploy taxsyncqc-email-automation \
  --image gcr.io/<project-id>/taxsyncqc-email-automation \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## AWS SES Configuration

See **[AWS_SES_SETUP.md](./AWS_SES_SETUP.md)** for complete SES configuration guide.

### Quick Summary:

1. **Create AWS account** and enable SES
2. **Verify your domain** in SES Console
3. **Add DNS records** (DKIM, SPF, DMARC)
4. **Create IAM user** with SES permissions
5. **Generate API credentials** (Access Key ID & Secret)
6. **Request production access** (optional, for sending to unverified emails)

---

## DNS Setup

### Required DNS Records for AWS SES

Add these DNS records to your domain registrar. AWS SES will provide exact values when you verify your domain.

#### DKIM Records (3 CNAME records for email authentication):
```
Type: CNAME
Host: [random-string]._domainkey.yourdomain.com
Value: [random-string].dkim.amazonses.com
```
(Repeat for all 3 DKIM records provided by AWS)

#### SPF Record (TXT for sender verification):
```
Type: TXT
Host: yourdomain.com (or @)
Value: v=spf1 include:amazonses.com ~all
```

#### DMARC Record (TXT for email policy - optional but recommended):
```
Type: TXT
Host: _dmarc.yourdomain.com
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
```

#### MX Records (for receiving emails - optional):
```
Type: MX
Host: yourdomain.com (or @)
Priority: 10
Value: inbound-smtp.us-east-2.amazonaws.com
```

### Verification

1. Add all DNS records provided by AWS SES
2. Wait 10-60 minutes for DNS propagation
3. Go to AWS SES Console → Verified identities
4. Check the status of your domain
5. All checks should be ✅ green (Verified)

---

## Environment Variables

### Complete List

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# AWS SES Configuration (REQUIRED)
AWS_ACCESS_KEY_ID=<your_access_key_id>
AWS_SECRET_ACCESS_KEY=<your_secret_access_key>
AWS_REGION=us-east-2
SES_FROM_DOMAIN=yourdomain.com

# Email Settings
TAXSYNC_FROM_EMAIL=notifications@yourdomain.com
TAXSYNCAI_FROM_EMAIL=ai-alerts@yourdomain.com

# Application Settings
APP_URL=https://isaloum.github.io/TaxSyncQC/
MAX_ATTACHMENT_SIZE=10485760
SUPPORTED_FILE_FORMATS=.pdf,.jpg,.jpeg,.png,.txt

# Tax Calculation Settings
BUSINESS_USE_PERCENTAGE=0.85
PHONE_BUSINESS_PERCENTAGE=0.50

# Security (Optional but Recommended)
REQUIRE_SIGNATURE_VERIFICATION=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_HOURS=1
```

### How to Set Variables by Platform

**Vercel:**
```bash
vercel env add VARIABLE_NAME
```

**Railway:**
```bash
railway variables set VARIABLE_NAME="value"
```

**Render:**
- Dashboard → Service → Environment → Add Environment Variable

**Docker:**
```bash
# Use .env file or -e flags
docker run -e AWS_ACCESS_KEY_ID="key" ...
```

---

## Testing & Validation

### 1. Health Check Test

```bash
# Test health endpoint
curl https://your-deployment-url.com/health

# Expected response:
{
  "status": "ok",
  "service": "TaxSyncQC Email Integration",
  "timestamp": "2025-01-16T00:00:00.000Z"
}
```

### 2. Document Processing Test

Process sample documents:

**T4 Slip:**
- Send T4 document via email
- Verify income and deductions extracted
- Check tax impact calculated

**RL-1 Slip:**
- Send RL-1 document via email
- Verify Quebec-specific fields extracted
- Check credit calculations updated

### 3. Integration Test Script

Create `test-deployment.sh`:
```bash
#!/bin/bash

DEPLOYMENT_URL="https://your-deployment-url.com"

echo "🧪 Testing TaxSyncQC Email Automation Deployment"
echo "================================================"

# Test 1: Health Check
echo "1️⃣ Testing health endpoint..."
HEALTH=$(curl -s "${DEPLOYMENT_URL}/health")
if echo "$HEALTH" | grep -q "ok"; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    exit 1
fi

echo "================================================"
echo "✅ Deployment tests completed"
```

Run with: `bash test-deployment.sh`

---

## Monitoring

### Application Logs

**Vercel:**
```bash
vercel logs
# Or view in dashboard: https://vercel.com/dashboard
```

**Railway:**
```bash
railway logs
# Real-time logs: railway logs -f
```

**Render:**
- Dashboard → Service → Logs

**Docker:**
```bash
docker logs -f taxsyncqc-email
```

### Key Metrics to Monitor

| Metric | Target | How to Check |
|--------|--------|--------------|
| **Uptime** | 99.9% | Health check endpoint |
| **Response Time** | < 30s | Email processing logs |
| **Success Rate** | > 95% | Email processing results |
| **Error Rate** | < 5% | Error logs |

### Set Up Alerts

**Recommended Monitoring Tools:**
- [UptimeRobot](https://uptimerobot.com) - Free uptime monitoring
- [Better Uptime](https://betteruptime.com) - Advanced monitoring
- [Sentry](https://sentry.io) - Error tracking

---

## Troubleshooting

### Common Issues

#### 1. "Access Denied" Error

**Cause:** AWS credentials not configured or incorrect

**Solution:**
```bash
# Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set
# Check IAM user has SES permissions
# Ensure AWS_REGION matches your SES region
```

#### 2. Emails Not Being Sent

**Cause:** SES in sandbox mode or domain not verified

**Solution:**
1. Check SES domain verification status
2. Verify sender and recipient emails (if in sandbox)
3. Request production access from AWS

#### 3. "500 Internal Server Error"

**Cause:** Missing environment variables or code error

**Solution:**
1. Check logs for specific error
2. Verify all required environment variables are set
3. Check that dependencies are installed

#### 4. Documents Not Being Classified

**Cause:** Document format not recognized

**Solution:**
1. Check document contains expected keywords
2. Verify file format is supported
3. Review classification logs
4. Test with sample documents

---

## Security Checklist

- [x] ✅ HTTPS endpoints only
- [x] ✅ AWS SES credentials secured (not in code)
- [x] ✅ Environment variables secured
- [x] ✅ Rate limiting configured
- [x] ✅ No document storage (memory processing only)
- [x] ✅ Input validation on all endpoints
- [x] ✅ Error messages don't leak sensitive data

---

## Next Steps

After successful deployment:

1. ✅ Test with sample documents
2. ✅ Set up monitoring and alerts
3. ✅ Configure custom domain (optional)
4. ✅ Document user onboarding process
5. ✅ Plan backup solution (optional)

---

## Quick Reference

### Essential Commands

```bash
# Test health
curl https://your-deployment-url.com/health

# View logs (Vercel)
vercel logs

# View logs (Railway)
railway logs

# Deploy updates (Vercel)
vercel --prod

# Deploy updates (Railway)
railway up
```

---

**Ready to deploy? Choose your platform above and follow the step-by-step guide!** 🚀

For AWS SES configuration, see **[AWS_SES_SETUP.md](./AWS_SES_SETUP.md)**.
