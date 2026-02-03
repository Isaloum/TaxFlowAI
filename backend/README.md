# TaxSyncQC Backend - Phase 1: Auth & Onboarding

Complete backend infrastructure for TaxSyncQC authentication and user onboarding system.

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
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- SMTP email service (Gmail, SendGrid, etc.)

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Setup environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/taxsyncqc?schema=public"
   JWT_SECRET="your-secret-key-here"
   SMTP_HOST="smtp.gmail.com"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   ```

3. **Setup database:**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

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

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio GUI

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment (development/production) | development |
| `JWT_SECRET` | Secret key for JWT signing | - |
| `JWT_EXPIRES_IN` | JWT token expiration | 24h |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |
| `SMTP_HOST` | SMTP server host | smtp.gmail.com |
| `SMTP_PORT` | SMTP server port | 587 |
| `SMTP_SECURE` | Use TLS | false |
| `SMTP_USER` | SMTP username | - |
| `SMTP_PASS` | SMTP password | - |
| `EMAIL_FROM` | Sender email address | noreply@taxsyncqc.com |
| `APP_NAME` | Application name | TaxSyncQC |
| `LOGIN_URL` | Login page URL | http://localhost:3000/login |

## 📝 Testing the API

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

### Database Connection Issues
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Run `npx prisma migrate dev` to create database

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
