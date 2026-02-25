import { RulesEngineService } from '../src/services/rules/rules-engine.service';

const taxYearId = process.argv[2];

if (!taxYearId) {
  console.error('Usage: ts-node test-validation.ts <taxYearId>');
  process.exit(1);
}

RulesEngineService.validateTaxYear(taxYearId)
  .then((result) => {
    console.log('\n✅ Validation Results:\n');
    console.log(`Completeness Score: ${result.completenessScore}%\n`);
    console.log('Validation Details:');
    result.results.forEach((r) => {
      const icon = r.status === 'pass' ? '✅' : r.status === 'warning' ? '⚠️' : '❌';
      console.log(`${icon} [${r.ruleCode}] ${r.message}`);
    });
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Validation failed:', err);
    process.exit(1);
  });
