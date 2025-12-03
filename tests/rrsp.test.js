import assert from 'node:assert/strict';
import { calculateRrspImpact } from '../rrsp-calculator.js';

test('calculateRrspImpact: no contribution', () => {
  const res = calculateRrspImpact(50000, 0);
  assert.strictEqual(typeof res.taxSaved, 'number');
  assert.strictEqual(typeof res.marginalRate, 'number');
});

test('calculateRrspImpact: with contribution reduces income', () => {
  const res = calculateRrspImpact(50000, 5000);
  assert.ok(res.newIncome < 50000);
});
