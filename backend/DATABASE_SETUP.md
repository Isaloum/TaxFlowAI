# Database Setup Guide

This guide explains how to set up and manage the TaxFlowAI PostgreSQL database using Prisma and Supabase.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account with a PostgreSQL database
- Database connection string (DATABASE_URL)

## Environment Setup

1. **Set up your environment variables**

   Create a `.env` file in the `backend` directory:

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_SERVICE_KEY="your-service-key"
   JWT_SECRET="your-jwt-secret"
   ```

2. **Get your Supabase connection string**

   - Log in to your Supabase project dashboard
   - Go to Settings > Database
   - Copy the "Connection String" (URI format)
   - Replace `[YOUR-PASSWORD]` with your actual database password

## Database Setup Commands

### 1. Push Schema to Database

Push your Prisma schema to the database (creates tables):

```bash
npm run db:push
```

Or directly with Prisma:

```bash
npx prisma db push
```

This command:
- Creates all tables defined in `prisma/schema.prisma`
- Updates existing tables to match the schema
- Does NOT create migration files (use for development)

### 2. Generate Prisma Client

After updating the schema, generate the Prisma Client:

```bash
npm run prisma:generate
```

Or:

```bash
npx prisma generate
```

### 3. Run Database Migrations (Production)

For production deployments, use migrations:

```bash
npm run db:migrate
```

Or:

```bash
npx prisma migrate deploy
```

### 4. Seed the Database

Create the default test accountant user and other seed data:

```bash
npm run db:seed
```

⚠️ **IMPORTANT - DEVELOPMENT/TESTING ONLY**

The seed script creates test users with default credentials:
- **Test Accountant User**
  - Email: `ihab@taxflowai.com`
  - Password: `TaxFlow2024!`
  - Firm Name: TaxFlowAI
  - Phone: +1-514-555-1234
  - Language: English

**These credentials are for development and testing purposes ONLY.**
**NEVER use these default credentials in production environments.**

You can override the default credentials using environment variables:
```bash
TEST_ACCOUNT_EMAIL="your@email.com" TEST_ACCOUNT_PASSWORD="YourPassword" npm run db:seed
```

The seed script is **idempotent** - it can be run multiple times safely without creating duplicates.

## Complete Setup Workflow

For a fresh database setup, follow these steps in order:

```bash
# 1. Install dependencies
npm install

# 2. Push schema to database (creates tables)
npm run db:push

# 3. Seed the database (creates test users)
npm run db:seed

# 4. Verify setup (optional)
npm run db:studio
```

## Database Management

### Open Prisma Studio

Prisma Studio provides a GUI to view and edit your database:

```bash
npm run db:studio
```

Access it at `http://localhost:5555`

### Create a Migration (Development)

When you change the schema:

```bash
npm run prisma:migrate
```

This will:
1. Create a new migration file
2. Apply it to your database
3. Update the Prisma Client

## Connecting to Supabase PostgreSQL

### Direct Connection (psql)

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### Using TablePlus/DBeaver

- Host: `db.[YOUR-PROJECT-REF].supabase.co`
- Port: `5432`
- User: `postgres`
- Password: Your database password
- Database: `postgres`
- SSL Mode: `require`

## Troubleshooting

### Issue: "Can't reach database server"

**Solution:**
1. Verify your DATABASE_URL is correct
2. Check if your IP is allowed in Supabase (Network Restrictions)
3. Ensure Supabase project is active

### Issue: "Prisma Client not found"

**Solution:**
```bash
npx prisma generate
```

### Issue: "Table already exists"

**Solution:**
This is normal if you're re-running migrations. Use:
```bash
npx prisma db push --accept-data-loss
```

**Warning:** This will delete data in development!

### Issue: "Authentication failed for user"

**Solution:**
1. Check your database password in the connection string
2. Ensure you're using the correct database user (usually `postgres`)
3. Try resetting your database password in Supabase Settings

### Issue: "Error creating seed user"

**Solution:**
1. Ensure tables are created first: `npm run db:push`
2. Check if the database is accessible
3. Verify DATABASE_URL environment variable is set

### Issue: "Port 5432 connection refused"

**Solution:**
1. Check if you're using the correct Supabase host
2. Verify your internet connection
3. Check Supabase service status

## Creating Additional Test Users

### Add Test Accountants

Edit `prisma/seed.ts` and add more upsert calls:

```typescript
const accountant2 = await prisma.accountant.upsert({
  where: { email: 'test@example.com' },
  update: { /* ... */ },
  create: {
    email: 'test@example.com',
    passwordHash: await bcrypt.hash('TestPassword123!', 12),
    firmName: 'Test Firm',
    phone: '+1-555-555-5555',
    languagePref: 'en',
  },
});
```

### Add Test Clients

```typescript
const client = await prisma.client.upsert({
  where: { email: 'client@example.com' },
  update: { /* ... */ },
  create: {
    email: 'client@example.com',
    passwordHash: await bcrypt.hash('ClientPassword123!', 12),
    firstName: 'John',
    lastName: 'Doe',
    province: 'QC',
    phone: '+1-555-123-4567',
    languagePref: 'fr',
    accountantId: accountant.id, // Link to accountant
  },
});
```

Then run: `npm run db:seed`

## Production Deployment Notes

1. **Never commit `.env` files** - Use secrets management
2. **Always use migrations in production** - Not `db:push`
3. **Run seeds carefully** - Only seed non-production data in dev/staging
4. **Use connection pooling** - Supabase provides pgBouncer
5. **Monitor database connections** - Lambda can exhaust connections

## Useful Commands Reference

| Command | Description |
|---------|-------------|
| `npm run db:push` | Push schema to database (dev) |
| `npm run db:seed` | Seed database with test data |
| `npm run db:migrate` | Deploy migrations (production) |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run prisma:generate` | Generate Prisma Client |
| `npx prisma migrate dev` | Create and apply migration (dev) |
| `npx prisma migrate reset` | Reset database and re-run migrations |
| `npx prisma db pull` | Introspect database and update schema |

## Support

For issues or questions:
- Check Supabase logs in your project dashboard
- Review Prisma documentation: https://www.prisma.io/docs
- Check application logs for error details

## Security Best Practices

1. **Never commit passwords** to version control
2. **Use strong passwords** for production databases
3. **Rotate JWT secrets** regularly
4. **Enable SSL/TLS** for database connections (required by Supabase)
5. **Use environment variables** for all sensitive configuration
6. **Limit database user permissions** to what the app needs
7. **Enable audit logging** in production
8. **Regular backups** - Supabase provides automatic backups
