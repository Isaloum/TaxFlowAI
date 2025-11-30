// credit-calculator.js - Calculation functions for the frontend
// Based on the same logic as the backend files

// Quebec Solidarity Tax Credit calculation
export function calculateSolidarityCredit(income) {
  const BASE = 531;
  const PHASEOUT_START = 57965, PHASEOUT_END = 64125;
  let amount = BASE;
  if (income > PHASEOUT_START) {
    if (income >= PHASEOUT_END) amount = 0;
    else amount *= (1 - (income - PHASEOUT_START) / (PHASEOUT_END - PHASEOUT_START));
  }
  return Math.round(amount * 100) / 100;
}

// Quebec Work Premium calculation
export function calculateWorkPremium(income) {
  if (income < 7200) return 0;
  const base = Math.min(income - 7200, 33100);
  return Math.min(Math.round(base * 0.26 * 100) / 100, 728);
}

// Federal Basic Personal Amount savings calculation
function calculateBPA(income) {
  const bpa = Math.max(0, 15705 - Math.max(0, income - 165430) * 15705 / 70000);
  return Math.round(bpa * 0.15 * 100) / 100;
}

// Federal Canada Workers Benefit calculation
function calculateCWB(income) {
  let cwb = 0;
  if (income <= 25539) cwb = Math.min(income * 0.27, 1519);
  else if (income <= 35539) cwb = Math.max(0, 1519 - (income - 25539) * 0.15);
  return Math.round(cwb * 100) / 100;
}

// RRSP Impact calculation
function calculateRrspImpact(income, contribution = 0) {
  contribution = Math.min(contribution, Math.min(income, 31560));
  const newIncome = Math.max(0, income - contribution);
  const marginalRate = income <= 51268 ? 0.2885 : income <= 57965 ? 0.3325 : 0.3885;
  return { contribution, newIncome, taxSaved: Math.round(contribution * marginalRate * 100) / 100 };
}

// Main function to calculate all credits
export function calculateCredits(inputData) {
  const { income, spouseIncome = 0, children = 0, rrspContribution = 0, disability = false, workIncident = false } = inputData;
  
  // Calculate effective income after RRSP contribution
  const rrsp = calculateRrspImpact(income, rrspContribution);
  const effectiveIncome = rrsp.newIncome;
  
  // Quebec credits (use effective income)
  const quebec = {
    solidarityCredit: calculateSolidarityCredit(effectiveIncome),
    workPremium: calculateWorkPremium(effectiveIncome)
  };
  
  // Federal credits
  const federal = {
    basicPersonalSavings: calculateBPA(effectiveIncome),
    cwb: calculateCWB(effectiveIncome)
  };
  
  // Calculate total savings
  const totalSavings = quebec.solidarityCredit + quebec.workPremium + federal.basicPersonalSavings + federal.cwb + rrsp.taxSaved;
  
  return {
    quebec,
    federal,
    totalSavings,
    rrsp: {
      contribution: rrspContribution,
      taxSaved: rrsp.taxSaved
    }
  };
}