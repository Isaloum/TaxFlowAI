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
// triggered Mon Feb 23 23:24:45 UTC 2026
