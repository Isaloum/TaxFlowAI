# TaxFlowAI Backend

Complete backend infrastructure for TaxFlowAI authentication, user onboarding, and document verification system.

## Phases

- **Phase 1: Auth & Onboarding** ✅ - Complete authentication and user management
- **Phase 2: Document Verification** 🔄 - Tax year tracking, document storage, OCR, validation rules

## 🚀 Quick Start

**New to TaxFlowAI?** Get started in under 5 minutes! See **[QUICKSTART.md](QUICKSTART.md)** for step-by-step instructions.

### One-Command Setup

```bash
cd backend
npm run setup
```

This automated script will:
- Create `.env` from template
- Install all dependencies
- Generate Prisma client
- Set up your Supabase database

Then update `.env` with your Supabase credentials and run:

```bash
npm run dev
```

**For detailed setup instructions, troubleshooting, and configuration guides, see [QUICKSTART.md](QUICKSTART.md)**

---

## 🎯 Features

### Phase 1: Auth & Onboarding ✅

- **Authentication System**
  - Accountant registration and login
  - Client login with temporary password
  - JWT-based authentication (24h expiration)
  - Password change functionality
  - Rate limiting on login endpoint (5 attempts per 15 minutes)

- **Accountant Management**
  - Create client accounts
  - View all clients
  - View client details
  - Delete clients
  - Automatic email invitation sending

- **Client Management**
  - View own profile
  - Update profile information
  - First login flag tracking

- **Security**
  - Argon2 password hashing
  - JWT token authentication
  - Input validation with Zod
  - CORS protection
  - Rate limiting

- **Email System**
  - Bilingual email templates (French/English)
  - Automatic temporary password generation
  - Client invitation emails

### Phase 2: Document Verification 🔄

- **Tax Year Tracking**
  - Multi-year client history management
  - Tax year status tracking (draft, submitted, reviewed, complete)
  - Client profile data per tax year
  - Completeness scoring system

- **Document Management**
  - Document upload and storage (Supabase Storage)
  - Document type classification (T4, RL1, T5, etc.)
  - OCR extraction with confidence scoring
  - Support for multiple file types

- **Validation System**
  - Automated completeness checks
  - Province-specific validation rules
  - Missing document detection
  - Validation result tracking

- **Notification System**
  - Real-time notifications for accountants and clients
  - Client submission alerts
  - Missing document notifications
  - Read/unread status tracking

- **Cost Optimization**
  - Tesseract OCR with Google Vision fallback
  - GPT-4o-mini for document classification
  - Supabase free tier optimization
  - See [COST_OPTIMIZATION.md](COST_OPTIMIZATION.md) for details

## 📁 Project Structure

```
backend/
├── prisma/
│   └── schema.prisma           # Database schema
├── scripts/
│   ├── test-api.js             # API test script
│   └── test-upload.js          # Document upload test script
├── src/
│   ├── config/
│   │   └── database.ts         # Prisma client configuration
│   ├── controllers/
│   │   ├── auth.controller.ts  # Authentication logic
│   │   ├── accountant.controller.ts
│   │   ├── client.controller.ts
│   │   └── document.controller.ts # Document management
│   ├── middleware/
│   │   ├── auth.ts             # JWT authentication middleware
│   │   └── upload.ts           # File upload middleware
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── accountant.routes.ts
│   │   ├── client.routes.ts
│   │   └── document.routes.ts  # Document API routes
│   ├── services/
│   │   ├── email.service.ts    # Email sending service
│   │   └── storage.service.ts  # Supabase Storage service
│   ├── types/
│   │   └── express.d.ts        # TypeScript type definitions
│   └── server.ts               # Main application entry point
├── .env.example                # Environment variables template
├── .gitignore
├── QUICKSTART.md               # Quick start guide
├── README.md                   # This file
├── package.json
├── setup.sh                    # Automated setup script
└── tsconfig.json
```

## 🚀 Getting Started

> **Quick Start:** See [QUICKSTART.md](QUICKSTART.md) for a streamlined setup guide with Supabase.

### Prerequisites

- Node.js (v18 or higher)
- Supabase account (PostgreSQL database with connection pooling)
- SMTP email service (Gmail with App Password, SendGrid, etc.)

### Automated Setup

Run the automated setup script:

```bash
cd backend
npm run setup
```

This will:
1. Create `.env` from `.env.example` (if it doesn't exist)
2. Install npm dependencies
3. Generate Prisma client
4. Push database schema to Supabase

After setup, edit `.env` with your credentials:
- Replace `[YOUR-PASSWORD]` in `DATABASE_URL` and `DIRECT_URL`
- Set your `JWT_SECRET` (32+ characters)
- Configure SMTP credentials for email

### Manual Installation

If you prefer manual setup:

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Setup environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your Supabase configuration:
   ```env
   # Get from Supabase Dashboard → Settings → Database
   # Replace YOUR-PROJECT-REF with your actual project reference
   DATABASE_URL="postgresql://postgres.YOUR-PROJECT-REF:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.YOUR-PROJECT-REF:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
   
   JWT_SECRET="your-secret-key-here-at-least-32-characters"
   SMTP_HOST="smtp.gmail.com"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-gmail-app-password"
   ```

3. **Setup database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```
   
   > **Note:** We use `db push` instead of `migrate dev` for Supabase as it's better suited for cloud databases with connection pooling.

4. **Start development server:**
   ```bash
   npm run dev
   ```

   Server will run on `http://localhost:3001`

### Supabase Storage Setup

For document upload functionality, you need to create a storage bucket in Supabase:

1. **Create Storage Bucket:**
   - Go to [Supabase Dashboard](https://app.supabase.com) → Your Project → Storage
   - Click "New bucket"
   - Name: `tax-documents`
   - Public bucket: Yes (or configure RLS policies for private access)
   - Click "Create bucket"

2. **Configure Environment Variables:**
   ```env
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key-here
   SUPABASE_STORAGE_BUCKET=tax-documents
   ```

   Get your credentials from:
   - SUPABASE_URL: Supabase Dashboard → Settings → API → Project URL
   - SUPABASE_SERVICE_KEY: Supabase Dashboard → Settings → API → service_role key (⚠️ Keep this secret!)

3. **(Optional) Configure Row Level Security (RLS):**
   
   If you want private bucket access, add these RLS policies:
   
   ```sql
   -- Allow authenticated users to upload to their own folder
   CREATE POLICY "Users can upload to own folder"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'tax-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

   -- Allow users to read their own files
   CREATE POLICY "Users can read own files"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (bucket_id = 'tax-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

   -- Allow users to delete their own files
   CREATE POLICY "Users can delete own files"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'tax-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
   ```

## 📡 API Endpoints

### Authentication (`/api/auth`)

#### Register Accountant
```http
POST /api/auth/register-accountant
Content-Type: application/json

{
  "email": "accountant@example.com",
  "password": "SecurePass123",
  "firmName": "ABC Accounting",
  "phone": "+1-514-555-0100",
  "languagePref": "fr"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```
**Note:** Rate limited to 5 attempts per 15 minutes

#### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldPass123",
  "newPassword": "newPass123"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### Accountant (`/api/accountant`)
**All endpoints require authentication with accountant role**

#### Create Client
```http
POST /api/accountant/clients
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "client@example.com",
  "firstName": "Jean",
  "lastName": "Tremblay",
  "province": "QC",
  "phone": "+1-514-555-0200",
  "languagePref": "fr"
}
```

#### Get All Clients
```http
GET /api/accountant/clients
Authorization: Bearer <token>
```

#### Get Client by ID
```http
GET /api/accountant/clients/:id
Authorization: Bearer <token>
```

#### Delete Client
```http
DELETE /api/accountant/clients/:id
Authorization: Bearer <token>
```

### Client (`/api/client`)
**All endpoints require authentication with client role**

#### Get Profile
```http
GET /api/client/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/client/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jean",
  "lastName": "Tremblay",
  "province": "QC",
  "phone": "+1-514-555-0200",
  "languagePref": "en"
}
```

#### Upload Document
```http
POST /api/client/tax-years/:year/documents
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form fields:
- file: (binary) - PDF, JPG, PNG, or HEIC file (max 10MB)
- docType: (string) - Document type (T4, RL1, T5, etc.)
- docSubtype: (string, optional) - Employer/institution name
```

#### List Documents for Tax Year
```http
GET /api/client/tax-years/:year/documents
Authorization: Bearer <token>
```

#### Delete Document
```http
DELETE /api/client/documents/:id
Authorization: Bearer <token>
```

#### Get Document Download URL
```http
GET /api/client/documents/:id/download
Authorization: Bearer <token>
```

#### Trigger Document Extraction
```http
POST /api/client/documents/:id/extract
Authorization: Bearer <token>
```

### Validation (`/api/client`)

#### Get Completeness Status
```http
GET /api/client/tax-years/:year/completeness
Authorization: Bearer <token>
```

**Response:**
```json
{
  "year": 2025,
  "status": "draft",
  "completenessScore": 65,
  "documentsUploaded": 4,
  "validations": [
    {
      "ruleCode": "QUEBEC_T4_RL1_PAIR",
      "status": "fail",
      "message": "Missing RL-1 for ABC Corporation. Quebec residents must have matching provincial slip.",
      "missingDocType": "RL1"
    },
    {
      "ruleCode": "QUEBEC_T5_RL3_PAIR",
      "status": "pass",
      "message": "T5 and RL3 pair complete"
    }
  ],
  "lastChecked": "2026-02-10T01:30:00Z"
}
```

#### Manually Trigger Validation
```http
POST /api/client/tax-years/:year/validate
Authorization: Bearer <token>
```

**Response:**
```json
{
  "completenessScore": 65,
  "results": [
    {
      "ruleCode": "QUEBEC_T4_RL1_PAIR",
      "status": "fail",
      "message": "Missing RL-1 for ABC Corporation. Quebec residents must have matching provincial slip.",
      "missingDocType": "RL1",
      "severity": "error"
    }
  ]
}
```

#### Update Tax Year Profile
```http
POST /api/client/tax-years/:year/update-profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "has_rrsp_contributions": true,
  "has_childcare_expenses": false,
  "has_medical_expenses": true,
  "has_donations": false,
  "claims_home_office": false
}
```

**Note:** Validation runs automatically after document upload/delete and profile updates.

## 🔍 Validation Rules Engine

### Quebec Federal/Provincial Pairing Rules
The system automatically validates that Quebec residents have matching federal and provincial tax slips:

- **T4 ↔ RL-1**: Employment income
- **T4A ↔ RL-2**: Pension, retirement, annuity income
- **T5 ↔ RL-3**: Investment income
- **T3 ↔ RL-16**: Trust income
- **T5008 ↔ RL-18**: Securities transactions
- **T2202 ↔ RL-8**: Tuition fees
- **T4RSP ↔ RL-2**: RRSP income

### Supporting Document Rules
Based on tax year profile, the system validates required supporting documents:

- **RRSP Contributions** → Requires RRSP receipts
- **Childcare Expenses** → Requires childcare receipts
- **Childcare Expenses (Quebec)** → Requires RL-24
- **Medical Expenses** → Requires medical receipts (warning)
- **Charitable Donations** → Requires donation receipts
- **Home Office Claims** → Requires T2200 from employer

### Year-over-Year Comparison
The system compares current year documents with previous year to flag potentially missing recurring documents (T4, T5, T4A, RL slips).

### Completeness Scoring
Documents are scored 0-100% based on validation results:
- **Pass**: +1 point
- **Warning**: -1 point
- **Error**: -2 points

## 🔐 Security Features

### Password Hashing
- Uses Argon2 algorithm (recommended by OWASP)
- Automatic salt generation
- Memory-hard function resistant to GPU attacks

### JWT Authentication
- 24-hour token expiration
- Includes user role (accountant/client)
- Secure token verification

### Input Validation
- Zod schema validation
- Email format validation
- Password strength requirements (min 8 characters)

### Rate Limiting
- Login endpoint: 5 attempts per 15 minutes
- Prevents brute force attacks

## 📧 Email System

### Client Invitation Email
When an accountant creates a client:
1. Generates 12-character random temporary password
2. Sends bilingual email (French + English)
3. Includes login credentials and URL
4. Client must change password on first login

### Email Template Features
- Responsive HTML design
- Bilingual content (primary language first)
- Clear call-to-action button
- Security warning about password change

## 🗄️ Database Schema

### Phase 1: Core Tables

#### Accountant
- `id` (String, CUID)
- `email` (String, unique)
- `passwordHash` (String)
- `firmName` (String)
- `phone` (String)
- `languagePref` (String: 'fr' or 'en')
- `createdAt` (DateTime)
- `updatedAt` (DateTime)
- `clients` (Relation to Client[])

#### Client
- `id` (String, CUID)
- `accountantId` (String, foreign key)
- `email` (String, unique)
- `passwordHash` (String)
- `firstName` (String)
- `lastName` (String)
- `province` (String)
- `phone` (String)
- `languagePref` (String: 'fr' or 'en')
- `isFirstLogin` (Boolean, default: true)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)
- `accountant` (Relation to Accountant)
- `taxYears` (Relation to TaxYear[])

### Phase 2: Document Verification Tables

#### TaxYear
- `id` (String, UUID)
- `clientId` (String, foreign key)
- `year` (Int)
- `status` (String: draft/submitted/reviewed/complete)
- `profile` (JSON: income types, family info, province data)
- `completenessScore` (Int: 0-100%)
- `submittedAt` (DateTime, nullable)
- `reviewedAt` (DateTime, nullable)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)
- `client` (Relation to Client)
- `documents` (Relation to Document[])
- `validations` (Relation to Validation[])
- Unique constraint: [clientId, year]

#### Document
- `id` (String, UUID)
- `taxYearId` (String, foreign key)
- `docType` (String: T4, RL1, T5, etc.)
- `docSubtype` (String, nullable: employer/institution)
- `originalFilename` (String, nullable)
- `fileUrl` (String: Supabase Storage URL)
- `fileSizeBytes` (Int, nullable)
- `mimeType` (String, nullable)
- `extractedData` (JSON: OCR results)
- `extractionStatus` (String: pending/processing/success/failed)
- `extractionConfidence` (Decimal: 0.00-1.00)
- `uploadedAt` (DateTime)
- `taxYear` (Relation to TaxYear)

#### Validation
- `id` (String, UUID)
- `taxYearId` (String, foreign key)
- `ruleCode` (String: e.g., "QUEBEC_T4_RL1_PAIR")
- `status` (String: pass/fail/warning)
- `message` (String, nullable)
- `missingDocType` (String, nullable)
- `checkedAt` (DateTime)
- `taxYear` (Relation to TaxYear)

#### Notification
- `id` (String, UUID)
- `recipientId` (String)
- `recipientType` (String: 'accountant' or 'client')
- `type` (String: notification type)
- `title` (String)
- `body` (String, nullable)
- `read` (Boolean, default: false)
- `createdAt` (DateTime)
- Index: [recipientId, read]

## 🛠️ Development

### Available Scripts

- `npm run setup` - Run automated setup (install, generate, migrate)
- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run test:api` - Test API endpoints (register & login)
- `npm run db:push` - Push Prisma schema to database
- `npm run db:studio` - Open Prisma Studio GUI
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations (for local dev)

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase pooled connection (transaction pooler) | - |
| `DIRECT_URL` | Supabase direct connection (for migrations) | - |
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment (development/production) | development |
| `JWT_SECRET` | Secret key for JWT signing | - |
| `JWT_EXPIRES_IN` | JWT token expiration | 24h |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |
| `SMTP_HOST` | SMTP server host | smtp.gmail.com |
| `SMTP_PORT` | SMTP server port | 587 |
| `SMTP_SECURE` | Use TLS | false |
| `SMTP_USER` | SMTP username | - |
| `SMTP_PASS` | SMTP password (use App Password for Gmail) | - |
| `EMAIL_FROM` | Sender email address | noreply@taxflowai.com |
| `APP_NAME` | Application name | TaxFlowAI |
| `LOGIN_URL` | Login page URL | http://localhost:3000/login |
| `SUPABASE_URL` | Supabase project URL | - |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | - |
| `SUPABASE_STORAGE_BUCKET` | Supabase storage bucket name | tax-documents |
| `OPENAI_API_KEY` | OpenAI API key for document classification | - |
| `GOOGLE_CLOUD_VISION_KEY_PATH` | Path to Google Vision API credentials (optional) | ./google-vision-key.json |
| `REDIS_URL` | Redis connection URL for background queue | redis://localhost:6379 |
| `USE_GOOGLE_VISION_FALLBACK` | Enable Google Vision API fallback | true |
| `TESSERACT_CONFIDENCE_THRESHOLD` | Minimum confidence threshold for Tesseract | 0.70 |


## 📝 Testing the API

### Using the Test Script

The easiest way to test:

```bash
npm run test:api
```

This automatically tests accountant registration and login endpoints.

### Using curl

```bash
# Register accountant
curl -X POST http://localhost:3001/api/auth/register-accountant \
  -H "Content-Type: application/json" \
  -d '{
    "email": "accountant@test.com",
    "password": "SecurePass123",
    "firmName": "Test Firm",
    "phone": "514-555-0100",
    "languagePref": "fr"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "accountant@test.com",
    "password": "SecurePass123"
  }'

# Create client (replace <TOKEN> with JWT from login)
curl -X POST http://localhost:3001/api/accountant/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "email": "client@test.com",
    "firstName": "Jean",
    "lastName": "Tremblay",
    "province": "QC",
    "phone": "514-555-0200",
    "languagePref": "fr"
  }'
```

## 🔍 Troubleshooting

> **For detailed troubleshooting, see [QUICKSTART.md](QUICKSTART.md#-troubleshooting)**

### Database Connection Issues
- Verify Supabase credentials in `.env`
- Ensure you replaced `[YOUR-PASSWORD]` in both `DATABASE_URL` and `DIRECT_URL`
- Check that your IP is allowed in Supabase Dashboard
- Run `npm run db:push` to sync schema

### Prisma Client Issues
- Run `npx prisma generate` to regenerate the client
- Delete `node_modules` and run `npm install` if issues persist

### Email Not Sending
- Verify SMTP credentials in `.env`
- For Gmail, use App Password (not regular password)
- Check firewall/network settings

### JWT Token Issues
- Ensure `JWT_SECRET` is set in `.env`
- Check token format: `Authorization: Bearer <token>`
- Verify token hasn't expired (24h default)

## 📄 License

MIT

## 👥 Support

For questions or issues, please contact the development team.
