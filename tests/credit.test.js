import assert from 'node:assert/strict';
import {
  calculateSolidarityCredit,
  calculateWorkPremium,
  calculateCWB,
} from '../credit-calculator.js';

test('calculateSolidarityCredit returns number', () => {
  const s = calculateSolidarityCredit(30000);
  assert.strictEqual(typeof s, 'number');
});

test('calculateWorkPremium returns number', () => {
  const w = calculateWorkPremium(25000);
  assert.strictEqual(typeof w, 'number');
});

test('calculateCWB returns number', () => {
  const c = calculateCWB(20000);
  assert.strictEqual(typeof c, 'number');
});
