# TaxFlowAI Backend - Quick Start Guide

Get the TaxFlowAI backend up and running in minutes with Supabase!

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **Supabase Account** ([Sign up free](https://supabase.com/))
- **Gmail Account** (for email functionality, optional for testing)

## 🚀 One-Command Setup

```bash
cd backend
npm run setup
```

This will:
- Create `.env` from `.env.example` if it doesn't exist
- Install all npm dependencies
- Generate Prisma client
- Push database schema to Supabase

## 📝 Detailed Setup Instructions

### 1. Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your project (or create a new one)
3. Navigate to **Settings** → **Database**
4. Scroll down to **Connection string**
5. Copy both connection strings:
   - **Transaction pooler** (for DATABASE_URL)
   - **Session pooler** (for DIRECT_URL)

**Important:** The connection strings will have `[YOUR-PASSWORD]` placeholder. Replace this with your actual database password. Also replace the project reference placeholder with your actual project ID.

### 2. Configure Environment Variables

After running `npm run setup`, edit the created `.env` file:

```env
# Replace YOUR-PROJECT-REF with your Supabase project reference
# Replace [YOUR-PASSWORD] with your actual Supabase password
DATABASE_URL="postgresql://postgres.YOUR-PROJECT-REF:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.YOUR-PROJECT-REF:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# Generate a secure JWT secret (use any random string, at least 32 characters)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars-long"

# Email configuration (optional for initial testing)
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### 3. Configure Gmail for Email (Optional)

To send client invitation emails:

1. **Enable 2-Step Verification** on your Google Account
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable "2-Step Verification"

2. **Generate App Password**
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Enter "TaxFlowAI Backend"
   - Click "Generate"
   - Copy the 16-character password

3. **Update .env**
   ```env
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="abcd efgh ijkl mnop"  # Your generated app password
   ```

**Note:** You can skip email configuration for initial testing. The backend will work, but client invitation emails won't be sent.

## 🎯 Start the Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

You should see:
```
🚀 Server is running on port 3001
✓ Database connected successfully
```

## 🧪 Test the API

### Option 1: Use the Test Script

```bash
npm run test:api
```

This will automatically:
- Register a test accountant
- Login and get a JWT token
- Display the results

### Option 2: Manual Testing with curl

**Register an accountant:**
```bash
curl -X POST http://localhost:3001/api/auth/register-accountant \
  -H "Content-Type: application/json" \
  -d '{
    "email": "accountant@test.com",
    "password": "SecurePass123",
    "firmName": "Test Accounting Firm",
    "phone": "+1-514-555-0100",
    "languagePref": "fr"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "accountant@test.com",
    "password": "SecurePass123"
  }'
```

### Option 3: Use Postman or Insomnia

Import the API endpoints from the main [README.md](README.md#-api-endpoints)

## 🗄️ Database Management

### View Database with Prisma Studio

```bash
npm run db:studio
```

This opens a GUI at `http://localhost:5555` to view and edit your database.

### Push Schema Changes

If you modify `prisma/schema.prisma`:

```bash
npm run db:push
```

## 🔍 Troubleshooting

### Database Connection Failed

**Error:** `Can't reach database server`

**Solutions:**
- Verify your Supabase password is correct in `.env`
- Check that you replaced `[YOUR-PASSWORD]` in both `DATABASE_URL` and `DIRECT_URL`
- Ensure your IP is allowed in Supabase (Dashboard → Settings → Database → Connection Pooling)
- Try resetting your database password in Supabase Dashboard

### Prisma Client Not Generated

**Error:** `Cannot find module '@prisma/client'`

**Solution:**
```bash
npx prisma generate
```

### Email Not Sending

**Error:** `Invalid login credentials` or `Connection timeout`

**Solutions:**
- Verify you're using an App Password, not your regular Gmail password
- Ensure 2-Step Verification is enabled on your Google Account
- Check that `SMTP_USER` and `SMTP_PASS` are correct in `.env`
- Try a different SMTP provider (SendGrid, Mailgun, etc.)

**Temporary workaround:** You can test the API without email functionality. The backend will log temporary passwords to the console when creating clients.

### Port Already in Use

**Error:** `Port 3001 is already in use`

**Solutions:**
- Change `PORT=3001` to another port in `.env` (e.g., `PORT=3002`)
- Or kill the process using port 3001:
  ```bash
  # On Linux/Mac
  lsof -ti:3001 | xargs kill
  
  # On Windows
  netstat -ano | findstr :3001
  taskkill /PID <PID> /F
  ```

### JWT Token Issues

**Error:** `Invalid token` or `Token expired`

**Solutions:**
- Ensure `JWT_SECRET` is set in `.env`
- Tokens expire after 24 hours - login again to get a fresh token
- Use the correct format: `Authorization: Bearer <your-token>`

### Schema Out of Sync

**Error:** `Prisma schema is out of sync with the database`

**Solution:**
```bash
npx prisma db push
```

This pushes your schema changes without creating migration files.

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed API documentation
- Explore the codebase in `/src` directory
- Check out [Prisma Studio](#database-management) to see your data
- Set up the frontend application

## 🆘 Getting Help

- Check the main [README.md](README.md) for comprehensive documentation
- Review Supabase documentation: https://supabase.com/docs
- Review Prisma documentation: https://www.prisma.io/docs

## 🎉 Success Checklist

- [ ] `.env` file created and configured
- [ ] Dependencies installed (`node_modules` exists)
- [ ] Prisma client generated
- [ ] Database schema pushed to Supabase
- [ ] Server starts without errors (`npm run dev`)
- [ ] Test API returns success (`npm run test:api`)
- [ ] Can register and login accountants

Once all items are checked, you're ready to develop! 🚀
