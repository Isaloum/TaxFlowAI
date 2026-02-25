// tax-calculator-bundle.js - Universal calculation module
(function (global) {
  'use strict';

  const MARGINAL_RATES = [
    { max: 51268, rate: 0.2885 },
    { max: 57965, rate: 0.3325 },
    { max: 110972, rate: 0.4375 },
    { max: 165430, rate: 0.5125 },
    { max: 235430, rate: 0.5825 },
    { max: Infinity, rate: 0.6625 },
  ];

  function calculateRrspImpact(income, contribution = 0) {
    const limit = Math.min(income, 31560);
    const rrsp = Math.min(contribution, limit);
    const newIncome = Math.max(0, income - rrsp);
    const rate = MARGINAL_RATES.find((b) => income <= b.max)?.rate || 0.6625;
    const taxSaved = rrsp * rate;
    return {
      contribution: rrsp,
      newIncome,
      taxSaved: Math.round(taxSaved * 100) / 100,
      marginalRate: rate,
    };
  }

  function calculateSolidarityCredit(income, isSingle = true) {
    const BASE = 531;
    const PHASEOUT_START = 57965;
    const PHASEOUT_END = 64125;
    let amount = isSingle ? BASE : 531 + 531;
    if (income > PHASEOUT_START) {
      if (income >= PHASEOUT_END) {
        amount = 0;
      } else {
        const reduction = (income - PHASEOUT_START) / (PHASEOUT_END - PHASEOUT_START);
        amount *= 1 - reduction;
      }
    }
    return Math.round(amount * 100) / 100;
  }

  function calculateWorkPremium(income, isSingle = true) {
    if (income < 7200) return 0;
    if (income > 57965) return 0;
    const base = Math.min(income - 7200, 33100);
    const raw = base * 0.26;
    const MAX_CREDIT = isSingle ? 728 : 1456;
    return Math.min(Math.round(raw * 100) / 100, MAX_CREDIT);
  }

  function calculateCWB(income, hasDependents = false) {
    const MAX_SINGLE = 1519;
    const MAX_FAMILY = 2528;
    const PHASEOUT_START_SINGLE = 25539;
    const PHASEOUT_START_FAMILY = 38325;
    const max = hasDependents ? MAX_FAMILY : MAX_SINGLE;
    const phaseoutStart = hasDependents ? PHASEOUT_START_FAMILY : PHASEOUT_START_SINGLE;
    if (income <= 17576) {
      return Math.min(income * 0.27, max);
    } else if (income <= phaseoutStart) {
      return max;
    } else if (income <= phaseoutStart + max / 0.15) {
      const excess = income - phaseoutStart;
      return Math.max(0, max - excess * 0.15);
    }
    return 0;
  }

  function calculateBPA(income) {
    const bpa = Math.max(0, 15705 - (Math.max(0, income - 165430) * 15705) / 70000);
    return Math.round(bpa * 0.15 * 100) / 100;
  }

  const TaxCalculator = {
    calculateRrspImpact,
    calculateSolidarityCredit,
    calculateWorkPremium,
    calculateCWB,
    calculateBPA,
    MARGINAL_RATES,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaxCalculator;
  }
  if (typeof window !== 'undefined') {
    window.TaxCalculator = TaxCalculator;
  }
  if (typeof global !== 'undefined') {
    global.TaxCalculator = TaxCalculator;
  }
})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this);
