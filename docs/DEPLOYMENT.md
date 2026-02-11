# TaxFlowAI Backend Deployment Guide

Complete guide for deploying the TaxFlowAI backend to AWS Lambda using AWS SAM (Serverless Application Model).

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Manual Deployment](#manual-deployment)
4. [Automated Deployment (CI/CD)](#automated-deployment-cicd)
5. [Environment Variables](#environment-variables)
6. [Testing Deployment](#testing-deployment)
7. [Troubleshooting](#troubleshooting)
8. [Cost Breakdown](#cost-breakdown)
9. [Monitoring & Logs](#monitoring--logs)

---

## Prerequisites

Before deploying TaxFlowAI backend to AWS Lambda, ensure you have:

### Required Tools

- **Node.js** 18.x or later ([Download](https://nodejs.org/))
- **AWS CLI** 2.x ([Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html))
- **AWS SAM CLI** ([Installation Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html))
- **Git** for version control

### AWS Account Requirements

- Active AWS account with permissions for:
  - AWS Lambda
  - API Gateway
  - CloudFormation
  - S3
  - IAM (to create roles)
  - CloudWatch (for logs)
  - SES (for email notifications)

### External Services

- **Supabase Account** with PostgreSQL database ([Sign up](https://supabase.com))
- **OpenAI API Key** ([Get API key](https://platform.openai.com/api-keys))

### Verify Prerequisites

```bash
# Check Node.js version (should be 18.x or later)
node --version

# Check AWS CLI version (should be 2.x)
aws --version

# Check SAM CLI version
sam --version

# Verify AWS credentials are configured
aws sts get-caller-identity
```

---

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Isaloum/TaxFlowAI.git
cd TaxFlowAI/backend
```

### 2. Install Dependencies

```bash
npm ci
```

### 3. Configure AWS Credentials

If not already configured:

```bash
aws configure
```

Provide:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `us-east-1`
- Default output format: `json`

### 4. Create S3 Bucket for SAM Artifacts

SAM needs an S3 bucket to store deployment artifacts:

```bash
aws s3 mb s3://taxflowai-sam-artifacts --region us-east-1
```

> **Note:** This bucket name must match the one in `samconfig.toml`

---

## Manual Deployment

### Step 1: Build TypeScript Code

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Step 2: Build SAM Application

```bash
sam build
```

This packages your Lambda functions and dependencies into the `.aws-sam/` directory.

### Step 3: Deploy with SAM

#### First-Time Deployment (Guided Mode)

```bash
sam deploy --guided
```

You'll be prompted for:

| Parameter | Value | Description |
|-----------|-------|-------------|
| Stack Name | `taxflowai-backend` | CloudFormation stack name |
| AWS Region | `us-east-1` | AWS region for deployment |
| DatabaseUrl | `<your-database-url>` | Supabase PostgreSQL connection string |
| SupabaseUrl | `<your-supabase-url>` | Supabase project URL |
| SupabaseServiceKey | `<your-service-key>` | Supabase service role key |
| OpenAIKey | `<your-openai-key>` | OpenAI API key |
| AllowedOrigin | `https://your-frontend-url.com` | Allowed CORS origin |
| Confirm changes | `Y` | Review changes before deploy |
| Allow SAM CLI IAM role creation | `Y` | Required for Lambda execution |
| Save arguments to config file | `Y` | Saves to `samconfig.toml` |

#### Subsequent Deployments

After the first deployment, simply run:

```bash
npm run build
sam build
sam deploy
```

SAM will use the saved configuration from `samconfig.toml`.

> ⚠️ **Security Note:** The `samconfig.toml` file contains sensitive credentials (database passwords, API keys). In production environments, consider:
> - Using AWS Secrets Manager or Parameter Store for credentials
> - Adding `samconfig.toml` to `.gitignore` if credentials are sensitive
> - Using environment-specific config files (e.g., `samconfig.prod.toml`)
> 
> For this project, credentials are included in the repository for deployment convenience, but this is **not recommended for production applications** with sensitive data.

### Step 4: Get API Endpoint

After successful deployment, SAM outputs the API Gateway endpoint:

```
Outputs
---------------------------------------------------------
Key                 ApiEndpoint
Description         API Gateway endpoint URL
Value               https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
---------------------------------------------------------
```

Save this endpoint - you'll need it for frontend configuration and testing.

---

## Automated Deployment (CI/CD)

The repository includes a GitHub Actions workflow for automatic deployment on every push to the `main` branch.

### Setup GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Add the following secrets:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `DATABASE_URL` | Supabase connection string | `postgresql://postgres:pass@...` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | `eyJhbGciOiJIUzI1NiIs...` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-proj-...` |

### Workflow Trigger

The workflow `.github/workflows/backend-deploy.yml` automatically triggers on:

- **Push to main branch** (only when `backend/**` files change)
- **Manual trigger** via GitHub Actions UI

### Deployment Process

The automated workflow:

1. ✅ Checks out code
2. ✅ Sets up Node.js 18.x
3. ✅ Installs AWS SAM CLI
4. ✅ Installs backend dependencies
5. ✅ Builds TypeScript code
6. ✅ Builds SAM application
7. ✅ Deploys to AWS Lambda
8. ✅ Runs API tests
9. ✅ Posts deployment status as PR comment

### Monitor Deployment

- Go to **Actions** tab in GitHub repository
- Click on the latest workflow run
- View real-time logs and deployment status

---

## Environment Variables

The backend requires the following environment variables, which are passed as SAM parameters during deployment:

### Required Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `DatabaseUrl` | PostgreSQL connection string | Supabase Dashboard → Settings → Database → Connection string (Session mode) |
| `SupabaseUrl` | Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `SupabaseServiceKey` | Service role key for server-side operations | Supabase Dashboard → Settings → API → service_role key (⚠️ Keep secret!) |
| `OpenAIKey` | OpenAI API key for document classification | OpenAI Platform → API keys |
| `AllowedOrigin` | Frontend URL for CORS | Your frontend domain (e.g., `https://app.example.com`) |

### Auto-Configured Variables

These are automatically set by SAM template:

| Variable | Value | Description |
|----------|-------|-------------|
| `SES_EMAIL` | `notifications@isaloumapps.com` | Sender email for notifications |
| `AWS_REGION` | `us-east-1` | AWS region |
| `NODE_ENV` | `production` | Node environment |

See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for detailed setup instructions.

---

## Testing Deployment

### Quick API Test

After deployment, test the API endpoint:

```bash
# Get API endpoint from SAM outputs
API_ENDPOINT=$(sam list stack-outputs --stack-name taxflowai-backend --output json | jq -r '.[] | select(.OutputKey=="ApiEndpoint") | .OutputValue')

# Test health endpoint (if available)
curl $API_ENDPOINT/health

# Test authentication endpoint
curl -X POST $API_ENDPOINT/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Automated Test Script

Run the comprehensive test script:

```bash
cd backend
./scripts/test-deployment.sh
```

This script tests:
- ✅ API Gateway connectivity
- ✅ CORS headers
- ✅ Authentication endpoints
- ✅ Response times
- ✅ Error handling

Expected output:
```
🧪 Testing TaxFlowAI Backend Deployment
========================================

✅ API Gateway is reachable
✅ CORS headers configured correctly
✅ Auth endpoint responding
✅ Average response time: 250ms

🎉 All tests passed!
```

### Manual Testing with Postman

1. Import the API endpoint URL
2. Create a POST request to `/auth/login`
3. Set headers:
   - `Content-Type: application/json`
   - `Origin: https://your-frontend-url.com`
4. Set body:
   ```json
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```
5. Verify CORS headers in response

---

## Troubleshooting

### Build Failures

#### "Cannot find module 'typescript'"

```bash
cd backend
npm ci
```

#### "Prisma schema not found"

```bash
npx prisma generate
```

#### "TypeScript compilation errors"

```bash
npm run build
# Review errors and fix code issues
```

### Deployment Failures

#### "S3 bucket does not exist"

Create the bucket:
```bash
aws s3 mb s3://taxflowai-sam-artifacts --region us-east-1
```

Or update `samconfig.toml` with an existing bucket name.

#### "Invalid parameter: DatabaseUrl"

Ensure your database URL is properly formatted:
```
postgresql://postgres:password@host:port/database
```

Check that special characters in password are URL-encoded.

#### "No changes to deploy"

If you need to force redeploy:
```bash
sam deploy --force-upload
```

#### "IAM permissions error"

Ensure your AWS credentials have permissions for:
- CloudFormation
- Lambda
- API Gateway
- IAM role creation
- S3 bucket access

### Runtime Errors

#### "Cannot connect to database"

1. Verify `DATABASE_URL` is correct
2. Check Supabase IP allowlist (allow all IPs: `0.0.0.0/0` or AWS Lambda IP ranges)
3. Test connection from Lambda:

```bash
sam logs -n AuthFunction --tail
```

#### "OpenAI API errors"

1. Verify API key is valid
2. Check OpenAI account has credits
3. Review rate limits

#### "CORS errors in frontend"

1. Verify `AllowedOrigin` parameter matches frontend URL exactly
2. Check that frontend includes `Origin` header
3. Update SAM parameter and redeploy:

```bash
sam deploy --parameter-overrides AllowedOrigin="'https://new-frontend-url.com'"
```

### Viewing Logs

#### Real-time logs for all functions

```bash
sam logs --tail
```

#### Logs for specific function

```bash
sam logs -n AuthFunction --tail
sam logs -n DocumentFunction --tail
```

#### Search logs for errors

```bash
sam logs -n AuthFunction --filter "ERROR"
```

#### CloudWatch Logs Console

1. Go to AWS Console → CloudWatch → Log groups
2. Find `/aws/lambda/taxflowai-backend-*`
3. Click on function name
4. Browse log streams

---

## Cost Breakdown

### AWS Free Tier

AWS provides generous free tier for the first 12 months:

| Service | Free Tier | Beyond Free Tier |
|---------|-----------|------------------|
| Lambda | 1M requests/month<br/>400,000 GB-seconds compute | $0.20 per 1M requests<br/>$0.0000166667 per GB-second |
| API Gateway | 1M API calls/month (12 months) | $3.50 per 1M requests |
| CloudWatch Logs | 5 GB ingestion<br/>5 GB storage | $0.50 per GB ingestion<br/>$0.03 per GB storage |
| S3 | 5 GB storage<br/>20,000 GET requests | $0.023 per GB<br/>$0.0004 per 1K requests |

### Estimated Monthly Costs

**Low Usage** (1,000 API calls/day, 30K/month):
- Lambda: **$0** (within free tier)
- API Gateway: **$0** (within free tier for 12 months)
- CloudWatch: **$0** (within free tier)
- S3: **$0** (within free tier)
- **Total: $0/month** (first 12 months)

**Moderate Usage** (10,000 API calls/day, 300K/month):
- Lambda: **$0** (within free tier)
- API Gateway: **$0** (within free tier for 12 months)
- CloudWatch: **~$1** (logs)
- S3: **~$1** (artifacts)
- **Total: ~$2/month** (first 12 months)

**After Free Tier** (300K requests/month):
- Lambda: **~$0.50**
- API Gateway: **~$1.05**
- CloudWatch: **~$1**
- S3: **~$1**
- **Total: ~$3.55/month**

> **Note:** Costs exclude external services (Supabase, OpenAI). See their pricing pages for details.

### Cost Optimization Tips

1. **Enable Lambda Memory Optimization**
   - Start with 1024 MB (current setting)
   - Monitor CloudWatch metrics
   - Adjust based on usage patterns

2. **Configure Log Retention**
   ```bash
   aws logs put-retention-policy \
     --log-group-name /aws/lambda/taxflowai-backend-AuthFunction \
     --retention-in-days 7
   ```

3. **Use Reserved Concurrency** (for production)
   - Prevents unexpected costs from traffic spikes
   - Set in Lambda console or SAM template

4. **Monitor with AWS Budgets**
   - Set up billing alerts
   - Get notified when costs exceed thresholds

---

## Monitoring & Logs

### CloudWatch Metrics

Key metrics to monitor:

1. **Invocations**: Number of function invocations
2. **Duration**: Execution time (optimize if consistently near timeout)
3. **Errors**: Failed invocations (investigate spikes)
4. **Throttles**: Rejected requests due to concurrency limits
5. **Concurrent Executions**: Number of simultaneous executions

### Access Metrics

**Via AWS Console:**
1. Go to CloudWatch → Metrics → All metrics
2. Select `AWS/Lambda`
3. Choose function name
4. Select metrics to graph

**Via SAM CLI:**
```bash
sam logs -n AuthFunction --tail
```

### Setting Up Alarms

Create an alarm for Lambda errors:

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name taxflowai-backend-errors \
  --alarm-description "Alert when Lambda errors exceed threshold" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=taxflowai-backend-AuthFunction
```

### X-Ray Tracing (Optional)

Enable AWS X-Ray for detailed request tracing:

1. Update `template.yaml`:
   ```yaml
   Globals:
     Function:
       Tracing: Active
   ```

2. Redeploy:
   ```bash
   sam build && sam deploy
   ```

3. View traces in AWS X-Ray Console

---

## Next Steps

After successful deployment:

1. ✅ **Configure Frontend** - Update frontend environment variables with API endpoint
2. ✅ **Set Up Custom Domain** - Configure API Gateway custom domain (optional)
3. ✅ **Enable Monitoring** - Set up CloudWatch alarms and dashboards
4. ✅ **Test End-to-End** - Verify frontend-backend integration
5. ✅ **Document API** - Update API documentation with production endpoint

---

## Additional Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [CloudWatch Logs Documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)

---

## Support

For deployment issues or questions:
- Check [Troubleshooting](#troubleshooting) section
- Review CloudWatch logs
- Open an issue on GitHub repository
- Contact the development team

---

**Last Updated:** 2026-02-11
