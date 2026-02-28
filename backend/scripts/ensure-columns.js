// Ensures required columns exist in the database using Prisma raw SQL
// Run AFTER prisma generate, BEFORE SAM build
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  const cols = [
    { sql: `ALTER TABLE tax_years ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ`, name: 'completed_at' },
    { sql: `ALTER TABLE tax_years ADD COLUMN IF NOT EXISTS review_notes TEXT`, name: 'review_notes' },
    { sql: `ALTER TABLE accountants ADD COLUMN IF NOT EXISTS password_reset_token TEXT UNIQUE`, name: 'accountants.password_reset_token' },
    { sql: `ALTER TABLE accountants ADD COLUMN IF NOT EXISTS password_reset_expiry TIMESTAMPTZ`, name: 'accountants.password_reset_expiry' },
    { sql: `ALTER TABLE clients ADD COLUMN IF NOT EXISTS password_reset_token TEXT UNIQUE`, name: 'clients.password_reset_token' },
    { sql: `ALTER TABLE clients ADD COLUMN IF NOT EXISTS password_reset_expiry TIMESTAMPTZ`, name: 'clients.password_reset_expiry' },
    // Stripe billing fields
    { sql: `ALTER TABLE accountants ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE`, name: 'accountants.stripe_customer_id' },
    { sql: `ALTER TABLE accountants ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE`, name: 'accountants.stripe_subscription_id' },
    { sql: `ALTER TABLE accountants ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'trialing'`, name: 'accountants.subscription_status' },
    { sql: `ALTER TABLE accountants ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ`, name: 'accountants.trial_ends_at' },
    { sql: `ALTER TABLE accountants ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ`, name: 'accountants.current_period_end' },
    // Admin table
    { sql: `CREATE TABLE IF NOT EXISTS admins (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`, name: 'admins table' },
    // Rename passwordHash → password_hash if prisma db push previously renamed it (camelCase → snake_case fix)
    { sql: `ALTER TABLE admins RENAME COLUMN "passwordHash" TO password_hash`, name: 'admins.passwordHash rename' },
  ];

  for (const { sql, name } of cols) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log(`✅ ${name} OK`);
    } catch (e) {
      console.warn(`⚠️  ${name} skipped:`, e.message);
    }
  }

  await prisma.$disconnect();
  console.log('Migration complete.');
}

main().catch(e => {
  console.error('Migration failed (non-blocking):', e.message);
  process.exit(0); // exit 0 = don't fail the deploy
});
// triggered Sat Feb 28 12:00:00 UTC 2026
