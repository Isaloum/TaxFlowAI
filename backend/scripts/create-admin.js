/**
 * Create the initial admin account.
 * Runs automatically during backend deploy (see backend-deploy.yml).
 * Safe to run multiple times — skips if admin already exists.
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email    = process.env.ADMIN_EMAIL    || 'admin@isaloumapps.com';
  const password = process.env.ADMIN_PASSWORD || 'AdminPass123!';

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log(`✅ Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.admin.create({
    data: { email, passwordHash },
  });

  console.log('✅ Admin created:', admin.email);
}

main()
  .catch(e => { console.error('create-admin failed:', e.message); })
  .finally(() => prisma.$disconnect());
