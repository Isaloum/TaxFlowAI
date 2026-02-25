# Backend AWS Lambda Deployment

This directory contains the serverless backend for TaxFlowAI, deployed as AWS Lambda functions using AWS SAM (Serverless Application Model).

## Architecture

The backend is split into 4 Lambda functions:

1. **AuthFunction** (`/auth/*`) - Authentication and user management
2. **DocumentFunction** (`/documents/*`) - Document upload, classification, and management
3. **UserFunction** (`/users/*`) - User profile and settings management
4. **NotificationFunction** (`/notifications/*`) - Email notifications via Amazon SES

All functions are fronted by API Gateway and accessed via the custom domain `api.isaloumapps.com`.

## Prerequisites

- AWS CLI configured with credentials
- AWS SAM CLI installed (`brew install aws-sam-cli` or see [AWS SAM docs](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html))
- Node.js 18.x or later
- S3 bucket for SAM artifacts: `taxflowai-sam-artifacts`

## Environment Variables

The following parameters are required for deployment and should be set as secrets:

- `DATABASE_URL` - Supabase PostgreSQL connection string
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_KEY` - Supabase service role key
- `OPENAI_API_KEY` - OpenAI API key for document classification

## Local Development

```bash
# Install dependencies
npm install

# Run locally with hot reload
npm run dev

# Build TypeScript
npm run build
```

## Deployment

### First-time deployment (Guided)

```bash
# Build the project
npm run build

# Build SAM application
sam build

# Deploy with guided prompts
sam deploy --guided
```

### Subsequent deployments

```bash
# Build and deploy
npm run build
sam build
sam deploy
```

## SAM Configuration

The `template.yaml` file defines:

- **API Gateway** with CORS configured for `https://isaloumapps.com`
- **Lambda Functions** with Node.js 18.x runtime
- **IAM Policies** for SES access
- **Environment Variables** passed from Parameters

## Testing

### Test Lambda functions locally

```bash
# Start API locally
sam local start-api

# Test endpoint
curl http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Invoke individual Lambda function

```bash
sam local invoke AuthFunction -e events/auth-login.json
```

## Monitoring

### View CloudWatch Logs

```bash
# View logs for a specific function
sam logs -n AuthFunction --tail

# View logs for all functions
sam logs --tail
```

### CloudWatch Metrics

Monitor Lambda metrics in AWS Console:
- Invocations
- Duration
- Errors
- Throttles

## Cost Optimization

- Lambda free tier: 1M requests/month, 400,000 GB-seconds compute time
- API Gateway free tier: 1M API calls/month (first 12 months)
- Expected cost for moderate usage: $5-20/month

## Troubleshooting

### Build fails

- Check Node.js version: `node --version` (should be 18.x)
- Clean and rebuild: `rm -rf .aws-sam/ && npm run build && sam build`

### Deployment fails

- Verify AWS credentials: `aws sts get-caller-identity`
- Check S3 bucket exists: `aws s3 ls s3://taxflowai-sam-artifacts`
- Verify all parameters are provided

### Lambda function errors

- Check CloudWatch Logs: `sam logs -n <FunctionName> --tail`
- Verify environment variables are set correctly
- Test locally: `sam local start-api`

## Related Files

- `template.yaml` - SAM template defining infrastructure
- `samconfig.toml.example` - Example SAM configuration
- `src/lambda/` - Lambda function handlers
- `src/services/ses-email.service.ts` - SES email service

## Additional Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [SES Documentation](https://docs.aws.amazon.com/ses/)
