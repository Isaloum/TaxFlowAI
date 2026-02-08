# TaxFlowAI Backend - Phase 1: Auth & Onboarding

Complete backend infrastructure for TaxFlowAI authentication and user onboarding system.

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

## 📁 Project Structure

```
backend/
├── prisma/
│   └── schema.prisma           # Database schema
├── scripts/
│   └── test-api.js             # API test script
├── src/
│   ├── config/
│   │   └── database.ts         # Prisma client configuration
│   ├── controllers/
│   │   ├── auth.controller.ts  # Authentication logic
│   │   ├── accountant.controller.ts
│   │   └── client.controller.ts
│   ├── middleware/
│   │   └── auth.ts             # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── accountant.routes.ts
│   │   └── client.routes.ts
│   ├── services/
│   │   └── email.service.ts    # Email sending service
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

### Accountant
- `id` (String, CUID)
- `email` (String, unique)
- `passwordHash` (String)
- `firmName` (String)
- `phone` (String)
- `languagePref` (String: 'fr' or 'en')
- `createdAt` (DateTime)
- `updatedAt` (DateTime)
- `clients` (Relation to Client[])

### Client
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
