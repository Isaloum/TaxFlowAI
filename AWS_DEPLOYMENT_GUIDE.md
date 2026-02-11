# AWS Deployment Guide for TaxFlowAI

This guide provides step-by-step instructions for deploying TaxFlowAI to AWS using the existing infrastructure at isaloumapps.com.

## Prerequisites

- AWS Account with access to:
  - Route 53 hosted zone: isaloumapps.com
  - SES verified email: notifications@isaloumapps.com
  - IAM permissions for Lambda, API Gateway, and Amplify
- GitHub repository with admin access
- AWS CLI installed and configured
- AWS SAM CLI installed
- Node.js 18.x or later

## Infrastructure Overview

### Components
1. **Frontend**: Next.js app deployed on AWS Amplify
   - Domain: https://isaloumapps.com
   - Auto-deployment on push to main branch

2. **Backend**: Express API converted to Lambda functions
   - API Domain: https://api.isaloumapps.com
   - Functions: Auth, Documents, Users, Notifications
   - API Gateway with CORS enabled

3. **Database**: Supabase PostgreSQL (existing, no changes)

4. **Email**: AWS SES
   - From: notifications@isaloumapps.com
   - Region: us-east-1

## Step 1: Configure GitHub Secrets

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```
AWS_ACCESS_KEY_ID          # AWS IAM access key
AWS_SECRET_ACCESS_KEY      # AWS IAM secret key
DATABASE_URL               # Supabase PostgreSQL connection string
SUPABASE_URL               # Supabase project URL
SUPABASE_SERVICE_KEY       # Supabase service role key
SUPABASE_ANON_KEY          # Supabase anonymous key (for frontend)
OPENAI_API_KEY             # OpenAI API key
```

## Step 2: Create S3 Bucket for SAM Artifacts

```bash
aws s3 mb s3://taxflowai-sam-artifacts --region us-east-1
```

## Step 3: Deploy Backend with AWS SAM

### Local Deployment (First Time)

```bash
cd backend

# Install dependencies
npm ci

# Build TypeScript code
npm run build

# Build SAM application
sam build

# Deploy (guided mode for first deployment)
sam deploy --guided
```

During guided deployment, provide:
- Stack Name: `taxflowai-backend`
- AWS Region: `us-east-1`
- Parameter DatabaseUrl: `<your-supabase-connection-string>`
- Parameter SupabaseUrl: `<your-supabase-url>`
- Parameter SupabaseServiceKey: `<your-supabase-service-key>`
- Parameter OpenAIKey: `<your-openai-api-key>`
- Confirm changes before deploy: `N`
- Allow SAM CLI IAM role creation: `Y`
- Save arguments to configuration file: `Y`

### Subsequent Deployments

```bash
cd backend
npm run build
sam build
sam deploy
```

## Step 4: Configure API Gateway Custom Domain

1. Go to AWS Console → API Gateway → Custom domain names
2. Create custom domain: `api.isaloumapps.com`
3. Configure ACM certificate (auto-created by AWS)
4. Add API mapping:
   - Path: `/`
   - API: `TaxFlowAPI`
   - Stage: `prod`

## Step 5: Update Route 53 DNS

1. Go to AWS Console → Route 53 → Hosted zones → isaloumapps.com
2. Create/Update records:

### A Record for Root Domain (Amplify)
```
Name: isaloumapps.com
Type: A
Alias: Yes
Target: <Amplify-app-domain>
```

### CNAME for API Subdomain
```
Name: api.isaloumapps.com
Type: CNAME
Value: <API-Gateway-custom-domain-target>
```

## Step 6: Configure AWS Amplify

### Connect GitHub Repository

1. Go to AWS Console → AWS Amplify
2. Create new app → Host web app
3. Connect GitHub repository: `Isaloum/TaxFlowAI`
4. Branch: `main`
5. Build settings: Use `amplify.yml` from repository
6. Advanced settings → Environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://api.isaloumapps.com
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   ```

### Configure Custom Domain

1. In Amplify app → Domain management
2. Add domain: `isaloumapps.com`
3. Configure DNS:
   - Root domain: `isaloumapps.com`
   - Subdomain: `www` (optional)
4. Wait for SSL certificate provisioning (5-10 minutes)

## Step 7: Configure AWS SES

### Verify Domain (if not already done)

1. Go to AWS Console → SES → Verified identities
2. Verify domain: `isaloumapps.com`
3. Add DNS records (DKIM, SPF) to Route 53

### Request Production Access

AWS SES starts in sandbox mode (can only send to verified emails):

1. Go to AWS Console → SES → Account dashboard
2. Request production access
3. Provide use case: "Tax document management platform sending transactional emails"
4. Wait for approval (usually 24-48 hours)

## Step 8: Test the Deployment

### Test Backend API

```bash
# Test auth endpoint
curl https://api.isaloumapps.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test notifications endpoint
curl https://api.isaloumapps.com/notifications/welcome \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","name":"Test User"}'
```

### Test Frontend

Visit https://isaloumapps.com and verify:
- Landing page loads correctly
- Login/signup links work
- Can navigate to dashboard after login

### Test Email Notifications

1. Register a new account
2. Check for welcome email from notifications@isaloumapps.com
3. Upload a document
4. Check for document processed email

## Step 9: Enable CI/CD

The deployment workflow is already configured in `.github/workflows/deploy.yml`.

### Trigger Automatic Deployment

```bash
git push origin main
```

This will:
1. Build and deploy backend to Lambda
2. Trigger Amplify frontend deployment
3. Run all tests

### Monitor Deployments

- Backend: Check AWS CloudFormation console for stack updates
- Frontend: Check AWS Amplify console for build status
- Logs: Check CloudWatch Logs for Lambda function logs

## Environment Variables Reference

### Backend (Lambda Functions)

Set via SAM template parameters:
- `DATABASE_URL`: Supabase PostgreSQL connection string
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_KEY`: Supabase service role key
- `OPENAI_API_KEY`: OpenAI API key
- `SES_EMAIL`: notifications@isaloumapps.com (hardcoded in template)
- `AWS_REGION`: us-east-1 (hardcoded in template)
- `NODE_ENV`: production (hardcoded in template)

### Frontend (Amplify)

Set in Amplify console:
- `NEXT_PUBLIC_API_URL`: https://api.isaloumapps.com
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key

## Troubleshooting

### Backend Issues

**Lambda function timeout:**
- Increase timeout in `template.yaml` (default: 30s)
- Check CloudWatch Logs for error details

**Database connection failed:**
- Verify DATABASE_URL is correct
- Check Supabase project is active
- Verify Lambda has internet access (use VPC if needed)

**CORS errors:**
- Verify API Gateway CORS settings in `template.yaml`
- Check AllowOrigin matches frontend domain

### Frontend Issues

**Build failed in Amplify:**
- Check build logs in Amplify console
- Verify all environment variables are set
- Check `amplify.yml` configuration

**API calls failing:**
- Verify NEXT_PUBLIC_API_URL is correct
- Check API Gateway endpoint is accessible
- Review browser console for CORS errors

### Email Issues

**Emails not sending:**
- Verify SES is out of sandbox mode
- Check recipient email is verified (in sandbox mode)
- Review CloudWatch Logs for SES errors

**Emails in spam:**
- Configure SPF, DKIM, DMARC records
- Request higher sending limits
- Warm up sender reputation gradually

## Monitoring and Maintenance

### CloudWatch Dashboards

Create dashboards to monitor:
- Lambda invocations and errors
- API Gateway requests and latency
- SES sending statistics

### CloudWatch Alarms

Set up alarms for:
- Lambda errors > threshold
- API Gateway 5xx errors
- SES bounce rate > threshold

### Cost Optimization

- Monitor AWS Cost Explorer
- Use Lambda reserved concurrency for cost control
- Enable S3 lifecycle policies for old SAM artifacts
- Review Amplify bandwidth usage

## Rollback Procedure

### Backend Rollback

```bash
# List previous stack versions
aws cloudformation list-stack-resources --stack-name taxflowai-backend

# Rollback to previous version
aws cloudformation rollback-stack --stack-name taxflowai-backend
```

### Frontend Rollback

1. Go to Amplify console
2. Select previous successful build
3. Click "Redeploy this version"

## Security Best Practices

1. **Secrets Management**
   - Never commit secrets to git
   - Use AWS Secrets Manager for sensitive data
   - Rotate credentials regularly

2. **IAM Permissions**
   - Use least privilege principle
   - Create separate IAM roles for each Lambda function
   - Enable MFA for AWS console access

3. **API Security**
   - Enable API Gateway request validation
   - Implement rate limiting
   - Use JWT tokens for authentication

4. **Monitoring**
   - Enable CloudTrail for audit logs
   - Set up security alerts
   - Review logs regularly

## Support

For issues or questions:
- Email: notifications@isaloumapps.com
- GitHub Issues: https://github.com/Isaloum/TaxFlowAI/issues
- AWS Support: https://console.aws.amazon.com/support/

## Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
