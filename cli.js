#!/usr/bin/env node
import { parseIncomeSlip } from './income-slip-parser.js';
import {
  calculateSolidarityCredit,
  calculateWorkPremium,
  calculateCWB,
} from './credit-calculator.js';
import { calculateRrspImpact } from './rrsp-calculator.js';

function estimateFederal(income, hasDependents = false) {
  const cwb = calculateCWB(income, hasDependents);
  // BPA: non-refundable, but we estimate monetary value at 15% Fed rate
  const bpa = Math.max(0, 15_705 - (Math.max(0, income - 165_430) * 15_705) / 70_000);
  const bpaSavings = bpa * 0.15;
  return { cwb: Math.round(cwb * 100) / 100, bpaSavings: Math.round(bpaSavings * 100) / 100 };
}

const args = process.argv.slice(2);
const idx = args.indexOf('--slip');
if (idx === -1) {
  console.error('Usage: node cli.js --slip "Case A: 60000" [--rrsp 5000]');
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

// Quebec credits
const qc = {
  solidarity: calculateSolidarityCredit(effectiveIncome),
  workPremium: calculateWorkPremium(effectiveIncome),
};

// Federal credits
const fed = estimateFederal(effectiveIncome);

// Totals
const qcTotal = qc.solidarity + qc.workPremium;
const fedTotal = fed.bpaSavings + fed.cwb;
const totalBenefit = qcTotal + fedTotal + rrsp.taxSaved;

console.log(`\n🧾 RL-1 + Federal + RRSP (2025)\n`);
console.log(`💼 Revenu brut: $${baseIncome}`);
if (rrspAmount > 0) {
  console.log(`📉 Après RRSP ($${rrspAmount}): $${effectiveIncome}`);
  console.log(`💰 Économie d'impôt (${Math.round(rrsp.marginalRate * 100)}%): $${rrsp.taxSaved}`);
}
console.log(`\n🇶🇨 Québec:`);
console.log(`  💰 Crédit solidarité: $${qc.solidarity}`);
console.log(`  👷 Prime au travail: $${qc.workPremium}`);
console.log(`\n🇨🇦 Fédéral:`);
console.log(`  🛡️ Économies BPA: $${fed.bpaSavings}`);
console.log(`  💵 PTE: $${fed.cwb}`);
console.log(`\n🎯 Avantage total: $${totalBenefit.toFixed(2)}`);
slip.warnings().forEach((w) => console.log(`⚠️ ${w}`));
