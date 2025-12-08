// credit-calculator.js — 2025 official credit formulas

/**
 * Calculate the Quebec Solidarity Tax Credit (Crédit pour la solidarité)
 * Based on Revenu Québec 2025 official guide (p.12)
 *
 * @param {number} income - Annual net income in CAD
 * @param {boolean} [isSingle=true] - Whether the person is single (true) or has a spouse (false)
 * @returns {number} Credit amount in CAD (rounded to 2 decimal places)
 */
export function calculateSolidarityCredit(income, isSingle = true) {
  const BASE = 531;
  const PHASEOUT_START = 57_965;
  const PHASEOUT_END = 64_125;

  let amount = isSingle ? BASE : 531 + 531; // single vs couple

  if (income > PHASEOUT_START) {
    if (income >= PHASEOUT_END) {
      amount = 0;
    } else {
      // Linear reduction over $6,160 (as per official guide)
      const reduction = (income - PHASEOUT_START) / (PHASEOUT_END - PHASEOUT_START);
      amount *= 1 - reduction;
    }
  }
  return Math.round(amount * 100) / 100;
}

/**
 * Calculate the Quebec Work Premium (Prime au travail)
 * Encourages low-income workers to remain in the workforce
 *
 * @param {number} income - Annual work income in CAD
 * @param {boolean} [isSingle=true] - Whether the person is single or has dependents
 * @returns {number} Credit amount in CAD (max $728 single, $1,456 with dependents)
 */
export function calculateWorkPremium(income, isSingle = true) {
  if (income < 7_200) return 0;

  // Eligibility: income ≤ $57,965 (2025 threshold)
  if (income > 57_965) return 0;

  const base = Math.min(income - 7_200, 33_100);
  const raw = base * 0.26;

  // Statutory cap: $728 (single), $1,456 (with dependents)
  const MAX_CREDIT = isSingle ? 728 : 1_456;
  return Math.min(Math.round(raw * 100) / 100, MAX_CREDIT);
}

/**
 * Calculate the Canada Workers Benefit (CWB) - Federal credit
 * Formerly known as the Working Income Tax Benefit (WITB)
 *
 * @param {number} income - Annual net income in CAD
 * @param {boolean} [hasDependents=false] - Whether the person has eligible dependents
 * @returns {number} Credit amount in CAD (max $1,519 single, $2,528 with dependents)
 */
export function calculateCWB(income, hasDependents = false) {
  const MAX_SINGLE = 1_519;
  const MAX_FAMILY = 2_528;
  const PHASEOUT_START_SINGLE = 25_539;
  const PHASEOUT_START_FAMILY = 38_325;

  const max = hasDependents ? MAX_FAMILY : MAX_SINGLE;
  const phaseoutStart = hasDependents ? PHASEOUT_START_FAMILY : PHASEOUT_START_SINGLE;

  if (income <= 17_576) {
    // Phase-in: 27% of income
    return Math.min(income * 0.27, max);
  } else if (income <= phaseoutStart) {
    return max;
  } else if (income <= phaseoutStart + max / 0.15) {
    // Phase-out: reduce by 15% above threshold
    const excess = income - phaseoutStart;
    return Math.max(0, max - excess * 0.15);
  }
  return 0;
}
