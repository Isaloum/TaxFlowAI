/**
 * Create the initial admin account.
 * Run once: npx ts-node scripts/create-admin.ts
 *
 * Override defaults with env vars:
 *   ADMIN_EMAIL=admin@you.com ADMIN_PASSWORD=YourPass123! npx ts-node scripts/create-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email    = process.env.ADMIN_EMAIL    || 'admin@isaloumapps.com';
  const password = process.env.ADMIN_PASSWORD || 'AdminPass123!';

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.admin.create({ data: { email, passwordHash } });

  console.log('✅ Admin created:');
  console.log(`   Email:    ${admin.email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Login at: /admin/login`);
  console.log('\n⚠️  Change the password after first login!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
