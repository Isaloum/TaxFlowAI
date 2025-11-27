#!/usr/bin/env node
import { parseIncomeSlip } from './income-slip-parser.js';
import { calculateSolidarityCredit, calculateWorkPremium } from './credit-calculator.js';

// Minimal federal logic (CWB + BPA)
function estimateFederal(income) {
  let cwb = 0;
  if (income <= 25539) cwb = Math.min(income * 0.27, 1519);
  else if (income <= 35539) cwb = Math.max(0, 1519 - (income - 25539) * 0.15);
  const bpa = Math.max(0, 15705 - Math.max(0, income - 165430) * 15705 / 70000);
  return { cwb: Math.round(cwb * 100) / 100, bpaSavings: Math.round(bpa * 0.15 * 100) / 100 };
}

function calculateRrspImpact(income, contribution = 0) {
  contribution = Math.min(contribution, Math.min(income, 31560));
  const newIncome = Math.max(0, income - contribution);
  const marginalRate = income <= 51268 ? 0.2885 : income <= 57965 ? 0.3325 : 0.3885;
  return { contribution, newIncome, taxSaved: Math.round(contribution * marginalRate * 100) / 100 };
}

const args = process.argv.slice(2);
const idx = args.indexOf('--slip');
if (idx === -1) {
  console.error('Usage: node cli.js --slip "Box A: 60000" [--rrsp 5000]');
  process.exit(1);
}
const text = args[idx + 1];
const rrspIdx = args.indexOf('--rrsp');
const rrspAmount = rrspIdx !== -1 ? parseFloat(args[rrspIdx + 1]) || 0 : 0;

const slip = parseIncomeSlip(text);
if (!slip.isValid()) {
  console.error('❌ Invalid slip — check income field.');
  process.exit(1);
}

const baseIncome = slip.employmentIncome;
const rrsp = calculateRrspImpact(baseIncome, rrspAmount);
const effectiveIncome = rrsp.newIncome;

// Quebec credits (use effective income)
const qc = {
  solidarity: calculateSolidarityCredit(effectiveIncome),
  workPremium: calculateWorkPremium(effectiveIncome)
};

// Federal credits
const fed = estimateFederal(effectiveIncome);

// Totals
const qcTotal = qc.solidarity + qc.workPremium;
const fedTotal = fed.bpaSavings + fed.cwb;
const totalBenefit = qcTotal + fedTotal + rrsp.taxSaved;

// Output
console.log(`\n🧾 ${slip.source} + Federal + RRSP (2025)\n`);
console.log(`💼 Revenu brut: $${baseIncome}`);
if (rrspAmount > 0) {
  console.log(`📉 Après RRSP ($${rrspAmount}): $${effectiveIncome}`);
  console.log(`💰 Économie d'impôt: $${rrsp.taxSaved}`);
}
console.log(`\n🇶🇨 Québec:`);
console.log(`  💰 Crédit solidarité: $${qc.solidarity}`);
console.log(`  👷 Prime au travail: $${qc.workPremium}`);
console.log(`\n🇨🇦 Fédéral:`);
console.log(`  🛡️ Économies BPA: $${fed.bpaSavings}`);
console.log(`  💵 PTE: $${fed.cwb}`);
console.log(`\n🎯 Avantage total: $${totalBenefit.toFixed(2)}`);
slip.warnings().forEach(w => console.log(`⚠️ ${w}`));
