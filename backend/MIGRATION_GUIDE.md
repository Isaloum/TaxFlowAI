# Database Migration Instructions

This document provides instructions for applying the Phase 2 database schema changes to your Supabase database.

## Schema Changes Summary

The following tables have been added for Phase 2 (Document Verification):

- **tax_years** - Tracks each client's tax year with status and profile data
- **documents** - Stores uploaded documents with OCR extraction results  
- **validations** - Stores completeness check results per tax year
- **notifications** - Tracks notifications for accountants and clients

The **clients** table has been updated with a new relation to tax_years.

## Migration Methods

### Method 1: Using Prisma DB Push (Recommended for Supabase)

This is the recommended method for Supabase as it works well with connection pooling.

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
```

### Method 2: Using Prisma Migrate Dev (For Local Development)

If you're using a local PostgreSQL database for development:

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name add-document-verification-tables
```

## Verification

After running the migration, verify the changes:

### 1. Check Prisma Client Generation

```bash
node scripts/validate-schema.js
```

Expected output:
```
✅ All models validated successfully!

New Phase 2 models added:
  - TaxYear (tax_years table)
  - Document (documents table)
  - Validation (validations table)
  - Notification (notifications table)
```

### 2. Check Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Table Editor
3. Verify the following tables exist:
   - `tax_years`
   - `documents`
   - `validations`
   - `notifications`

### 3. Verify Relations

In Prisma Studio (optional):

```bash
npx prisma studio
```

Check that:
- Clients can have multiple TaxYears
- TaxYears can have multiple Documents and Validations
- All foreign key relationships are properly set up

## Rollback

If you need to rollback these changes:

### Using DB Push
You'll need to manually drop the tables in Supabase:

```sql
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS validations;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS tax_years;
```

### Using Migrate
```bash
npx prisma migrate resolve --rolled-back add-document-verification-tables
```

## Troubleshooting

### Error: "Environment variable not found: DATABASE_URL"

Make sure you have a `.env` file in the backend directory with your Supabase credentials:

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Error: "P2021: The table does not exist in the current database"

This usually means the migration hasn't been applied yet. Run:

```bash
npx prisma db push
```

### Error: Connection timeout

Check your Supabase database credentials and ensure your IP is whitelisted in the Supabase dashboard.

## Next Steps

After successful migration:

1. The Prisma Client will have new types available:
   - `TaxYear`
   - `Document`
   - `Validation`
   - `Notification`

2. You can start building the Phase 2 features:
   - Tax year management endpoints
   - Document upload and OCR
   - Validation rules engine
   - Notification system

For cost optimization strategies, see [COST_OPTIMIZATION.md](COST_OPTIMIZATION.md).
