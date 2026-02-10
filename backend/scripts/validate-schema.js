/**
 * Schema Validation Script
 * Validates that all new models are accessible in Prisma Client
 */

const { PrismaClient } = require('@prisma/client');

async function validateSchema() {
  const prisma = new PrismaClient();
  
  try {
    console.log('✓ Prisma Client initialized successfully');
    
    // Check that all new models are accessible
    const models = [
      'taxYear',
      'document',
      'validation',
      'notification',
      'client',
      'accountant'
    ];
    
    for (const model of models) {
      if (prisma[model]) {
        console.log(`✓ Model '${model}' is accessible`);
      } else {
        console.error(`✗ Model '${model}' is NOT accessible`);
        process.exit(1);
      }
    }
    
    console.log('\n✅ All models validated successfully!');
    console.log('\nNew Phase 2 models added:');
    console.log('  - TaxYear (tax_years table)');
    console.log('  - Document (documents table)');
    console.log('  - Validation (validations table)');
    console.log('  - Notification (notifications table)');
    console.log('\nExisting Phase 1 models:');
    console.log('  - Client (clients table) - updated with taxYears relation');
    console.log('  - Accountant (accountants table)');
    
  } catch (error) {
    console.error('Error validating schema:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

validateSchema();
