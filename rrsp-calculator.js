// rrsp-calculator.js — 2025 official marginal tax rates (QC + Fed)
// Source: Revenu Québec 2025 Taxation Guide + CRA 2025 Rates

/**
 * 2025 Combined Quebec + Federal marginal tax rate brackets
 * Each bracket defines maximum income and the combined tax rate
 *
 * @type {Array<{max: number, rate: number}>}
 */
export const MARGINAL_RATES = [
  { max: 51_268, rate: 0.2885 }, // 15% Fed + 13.85% QC
  { max: 57_965, rate: 0.3325 }, // +4.4% QC solidarity surtax
  { max: 110_972, rate: 0.4375 }, // 20.5% Fed + 23.25% QC
  { max: 165_430, rate: 0.5125 },
  { max: 235_430, rate: 0.5825 },
  { max: Infinity, rate: 0.6625 },
];

/**
 * Calculate RRSP contribution impact on taxable income and tax savings
 * Uses the pre-RRSP income to determine marginal tax rate
 *
 * @param {number} income - Annual income before RRSP contribution in CAD
 * @param {number} [contribution=0] - RRSP contribution amount in CAD
 * @returns {{contribution: number, newIncome: number, taxSaved: number, marginalRate: number}}
 *   Object containing contribution amount, new taxable income, tax saved, and marginal rate
 */
export function calculateRrspImpact(income, contribution = 0) {
  // RRSP limit 2025 = 18% of $175,333 = $31,560
  const limit = Math.min(income, 31_560);
  const rrsp = Math.min(contribution, limit);
  const newIncome = Math.max(0, income - rrsp);

  // Use pre-RRSP income to determine marginal rate (correct for tax savings)
  const rate = MARGINAL_RATES.find((b) => income <= b.max)?.rate || 0.6625;
  const taxSaved = rrsp * rate;

  return {
    contribution: rrsp,
    newIncome,
    taxSaved: Math.round(taxSaved * 100) / 100,
    marginalRate: rate,
  };
}
