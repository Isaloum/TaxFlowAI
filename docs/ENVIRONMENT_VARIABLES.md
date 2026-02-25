# Environment Variables Guide

Complete guide for configuring environment variables for TaxFlowAI backend deployment.

## 📋 Table of Contents

1. [Required Environment Variables](#required-environment-variables)
2. [Getting Supabase Credentials](#getting-supabase-credentials)
3. [Getting OpenAI API Key](#getting-openai-api-key)
4. [AWS Configuration](#aws-configuration)
5. [Frontend Configuration](#frontend-configuration)
6. [Security Best Practices](#security-best-practices)

---

## Required Environment Variables

The TaxFlowAI backend requires the following environment variables for deployment:

### Production Environment (AWS Lambda)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DatabaseUrl` | PostgreSQL connection string | ✅ Yes | `postgresql://postgres:pass@host:5432/db` |
| `SupabaseUrl` | Supabase project URL | ✅ Yes | `https://xxx.supabase.co` |
| `SupabaseServiceKey` | Supabase service role key | ✅ Yes | `eyJhbGciOiJIUzI1NiIs...` |
| `OpenAIKey` | OpenAI API key | ✅ Yes | `sk-proj-...` |
| `AllowedOrigin` | Frontend URL for CORS | ✅ Yes | `https://app.example.com` |

### Auto-Configured Variables

These are set automatically by the SAM template:

| Variable | Value | Description |
|----------|-------|-------------|
| `SES_EMAIL` | `notifications@isaloumapps.com` | Email sender address |
| `AWS_REGION` | `us-east-1` | AWS deployment region |
| `NODE_ENV` | `production` | Node.js environment |

---

## Getting Supabase Credentials

Supabase provides PostgreSQL database hosting with real-time capabilities.

### 1. Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub, Google, or email
4. Verify your email address

### 2. Create a New Project

1. Click **"New Project"**
2. Fill in project details:
   - **Name:** `taxflowai` (or your preferred name)
   - **Database Password:** Generate a strong password (save it securely!)
   - **Region:** Choose closest to your users (e.g., `us-east-1`)
   - **Pricing Plan:** Start with Free tier
3. Click **"Create new project"**
4. Wait 2-3 minutes for provisioning

### 3. Get Database Connection String

1. In your Supabase project dashboard
2. Go to **Settings** (⚙️ icon in sidebar) → **Database**
3. Scroll to **Connection string** section
4. Select **"Session mode"** (recommended for serverless)
5. Copy the connection string:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
6. Replace `[YOUR-PASSWORD]` with your actual database password

> **Important:** Use **Session mode** (port 6543) for Lambda functions, not Direct connection (port 5432)

### 4. Get Supabase URL

1. In Supabase dashboard → **Settings** → **API**
2. Find **Project URL** under "Config"
3. Copy the URL (format: `https://[PROJECT-REF].supabase.co`)

### 5. Get Service Role Key

1. In Supabase dashboard → **Settings** → **API**
2. Scroll to **Project API keys** section
3. Find **service_role** key (not anon key!)
4. Click **"Reveal"** and copy the key

> ⚠️ **Security Warning:** The service_role key has full database access. Never expose it in frontend code or commit to git.

### 6. Configure IP Allowlist (Optional)

For enhanced security:

1. Go to **Settings** → **Database**
2. Scroll to **Network Restrictions**
3. Add AWS Lambda IP ranges for us-east-1:
   - Or allow all IPs: `0.0.0.0/0` (easier for Lambda)

### Supabase Free Tier Limits

- Database: 500 MB storage
- Bandwidth: 5 GB egress
- API requests: 500,000/month
- File storage: 1 GB

More than sufficient for development and small-scale production use.

---

## Getting OpenAI API Key

OpenAI API is used for document classification and intelligent tax document processing.

### 1. Create OpenAI Account

1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Click **"Sign up"**
3. Register with email or Google account
4. Verify your email

### 2. Add Payment Method

1. Go to **Settings** → **Billing**
2. Click **"Add payment method"**
3. Enter credit card details
4. Set usage limits (recommended: $10-20/month for testing)

> **Note:** OpenAI requires a payment method even for API access, though they offer free credits for new users.

### 3. Create API Key

1. Go to **API keys** section (or [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys))
2. Click **"Create new secret key"**
3. Give it a name (e.g., "TaxFlowAI Backend")
4. Set permissions:
   - **All** (for development)
   - Or **Restricted** with only necessary permissions
5. Click **"Create secret key"**
6. **Copy the key immediately** (you won't see it again!)

Format: `sk-proj-...` or `sk-...`

### 4. Monitor Usage

1. Go to **Usage** → **Activity**
2. Monitor API calls and costs
3. Set up usage alerts

### OpenAI Pricing (as of 2026)

TaxFlowAI uses **GPT-4o-mini** for document classification:

- **Input:** $0.15 per 1M tokens
- **Output:** $0.60 per 1M tokens

**Estimated costs for document classification:**
- 100 documents/month: ~$0.50
- 1,000 documents/month: ~$5
- 10,000 documents/month: ~$50

### Free Credits

New accounts often receive $5-18 in free credits valid for 3 months.

---

## AWS Configuration

### 1. Create AWS Account

1. Go to [https://aws.amazon.com](https://aws.amazon.com)
2. Click **"Create an AWS Account"**
3. Follow signup process
4. Provide payment information (free tier available)

### 2. Create IAM User for Deployment

1. Go to **IAM** → **Users**
2. Click **"Create user"**
3. Username: `taxflowai-deployer`
4. Select **"Programmatic access"**
5. Click **Next: Permissions**

### 3. Attach Policies

Select these policies (or create a custom policy):

- `AWSLambda_FullAccess`
- `IAMFullAccess` (for creating execution roles)
- `AmazonS3FullAccess`
- `CloudFormationFullAccess`
- `AmazonAPIGatewayAdministrator`
- `CloudWatchFullAccess`

> **Production Note:** Use least-privilege policies in production. The above are for development convenience.

### 4. Save Credentials

After creating the user:

1. **Copy Access Key ID** (format: `AKIAIOSFODNN7EXAMPLE`)
2. **Copy Secret Access Key** (format: `wJalrXUtnFEMI/K7MDENG/...`)
3. Store securely (you won't see the secret key again!)

### 5. Configure AWS CLI

```bash
aws configure
```

Enter:
- **AWS Access Key ID:** [paste access key]
- **AWS Secret Access Key:** [paste secret key]
- **Default region:** `us-east-1`
- **Default output format:** `json`

### 6. Verify Configuration

```bash
aws sts get-caller-identity
```

Should return your account ID and user ARN.

### 7. Set Up SES (Email Service)

1. Go to **Amazon SES** console
2. Select region: **us-east-1**
3. Go to **Verified identities**
4. Click **"Create identity"**
5. Choose **Email address**
6. Enter: `notifications@yourdomain.com`
7. Verify the email (check inbox for verification link)

> **Note:** In SES sandbox mode, you can only send to verified email addresses. Request production access to send to any email.

### 8. Request SES Production Access (Optional)

For production use:

1. Go to **Amazon SES** → **Account dashboard**
2. Click **"Request production access"**
3. Fill out the form:
   - **Use case:** Tax document management platform
   - **Describe how you handle bounces:** Automated bounce handling
   - **Average send rate:** 100 emails/day
4. Submit (usually approved in 24-48 hours)

---

## Frontend Configuration

The frontend (Next.js on AWS Amplify) requires different environment variables.

### Required Frontend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | `https://api.example.com/prod` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIs...` |

### Get Supabase Anon Key

1. Go to Supabase dashboard → **Settings** → **API**
2. Find **anon** key under "Project API keys"
3. Copy the key (this is safe to expose in frontend)

### Configure in AWS Amplify

1. Go to AWS Amplify console
2. Select your app
3. Go to **Environment variables**
4. Add each variable:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: [your API endpoint]
5. Click **Save**
6. Redeploy the app

---

## Security Best Practices

### 🔒 General Principles

1. **Never commit secrets to Git**
   - Use `.env` files (add to `.gitignore`)
   - Use GitHub Secrets for CI/CD
   - Use AWS Secrets Manager for production

2. **Use different credentials for each environment**
   - Development database
   - Staging database
   - Production database

3. **Rotate credentials regularly**
   - Change passwords every 90 days
   - Rotate API keys quarterly
   - Update after team member leaves

4. **Implement least privilege**
   - Only grant necessary permissions
   - Use read-only keys where possible
   - Limit API key scopes

### 🔐 Protecting Database Credentials

#### Do:
- ✅ Use connection pooling (Session mode)
- ✅ Enable SSL/TLS for connections
- ✅ Use environment variables
- ✅ Implement IP restrictions
- ✅ Monitor connection logs

#### Don't:
- ❌ Hardcode passwords in code
- ❌ Share credentials via email/Slack
- ❌ Use weak passwords
- ❌ Commit `.env` files to Git
- ❌ Use production credentials in development

### 🔑 API Key Security

#### OpenAI API Keys:
- Set usage limits to prevent runaway costs
- Monitor usage daily
- Revoke unused keys
- Use separate keys per environment

#### Supabase Keys:
- **Service role key:** Backend only, never expose
- **Anon key:** Frontend safe, has RLS restrictions
- Enable Row Level Security (RLS) on all tables

### 🛡️ AWS Security

1. **Enable MFA** on root account
2. **Use IAM roles** instead of access keys when possible
3. **Enable CloudTrail** for audit logs
4. **Set up billing alerts** to detect breaches
5. **Regular security reviews** with AWS Trusted Advisor

### 📊 Monitoring

Set up alerts for:
- Unusual database connections
- High API usage
- Failed authentication attempts
- AWS cost spikes

### 🚨 Incident Response

If credentials are compromised:

1. **Immediately revoke** the exposed credential
2. **Create new credential** with different value
3. **Update** all deployments with new credential
4. **Review logs** for unauthorized access
5. **Document** the incident
6. **Notify** affected users if data was accessed

### 📝 Credential Storage

#### Development:
```bash
# .env file (not committed)
DATABASE_URL="postgresql://..."
SUPABASE_URL="https://..."
```

#### GitHub Actions:
- Store in **Repository Secrets**
- Access via `${{ secrets.SECRET_NAME }}`

#### Production:
- Use **AWS Secrets Manager**
- Automatic rotation
- Audit logging

---

## Environment Variable Checklist

Use this checklist to ensure all variables are properly configured:

### Backend Deployment

- [ ] `DATABASE_URL` configured with Supabase connection string
- [ ] `SUPABASE_URL` set to project URL
- [ ] `SUPABASE_SERVICE_KEY` set (service_role, not anon)
- [ ] `OPENAI_API_KEY` configured and has credits
- [ ] `AllowedOrigin` matches frontend URL exactly
- [ ] All secrets added to GitHub repository secrets
- [ ] AWS credentials configured (`aws configure`)
- [ ] S3 bucket created for SAM artifacts

### Frontend Deployment

- [ ] `NEXT_PUBLIC_API_URL` set to API Gateway endpoint
- [ ] `NEXT_PUBLIC_SUPABASE_URL` matches backend
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configured (anon key)
- [ ] Environment variables set in AWS Amplify
- [ ] Frontend domain configured for CORS

### Security

- [ ] No credentials committed to Git
- [ ] `.env` files in `.gitignore`
- [ ] MFA enabled on AWS account
- [ ] Billing alerts configured
- [ ] Usage monitoring set up
- [ ] IP restrictions configured (if applicable)

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)
- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [12-Factor App Methodology](https://12factor.net/config)

---

## Support

For questions about environment configuration:
- Check the main [DEPLOYMENT.md](./DEPLOYMENT.md) guide
- Review CloudWatch logs for connection issues
- Verify all credentials are current and valid
- Contact the development team

---

**Last Updated:** 2026-02-11
