import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateRrspImpact, MARGINAL_RATES } from '../rrsp-calculator.js';

test('calculateRrspImpact: no contribution', () => {
  const result = calculateRrspImpact(50000, 0);
  assert.strictEqual(result.contribution, 0);
  assert.strictEqual(result.newIncome, 50000);
  assert.strictEqual(result.taxSaved, 0);
});

test('calculateRrspImpact: with contribution reduces income', () => {
  const result = calculateRrspImpact(60000, 5000);
  assert.strictEqual(result.contribution, 5000);
  assert.strictEqual(result.newIncome, 55000);
  assert.ok(result.taxSaved > 0);
});

test('calculateRrspImpact: contribution capped at limit', () => {
  const result = calculateRrspImpact(60000, 50000);
  assert.ok(result.contribution <= 31560); // 2025 RRSP limit
});

test('calculateRrspImpact: uses correct marginal rate', () => {
  const result = calculateRrspImpact(60000, 5000);
  // Income 60000 should be in third bracket (rate 0.4375)
  assert.strictEqual(result.marginalRate, 0.4375);
});

test('calculateRrspImpact: tax saved equals contribution × rate', () => {
  const result = calculateRrspImpact(60000, 5000);
  const expectedSaved = Math.round(5000 * result.marginalRate * 100) / 100;
  assert.strictEqual(result.taxSaved, expectedSaved);
});

test('calculateRrspImpact: handles edge case of zero income', () => {
  const result = calculateRrspImpact(0, 1000);
  assert.strictEqual(result.contribution, 0);
  assert.strictEqual(result.newIncome, 0);
  assert.strictEqual(result.taxSaved, 0);
});

test('calculateRrspImpact: highest marginal rate for high income', () => {
  const result = calculateRrspImpact(300000, 10000);
  assert.strictEqual(result.marginalRate, 0.6625);
});

test('MARGINAL_RATES: has 6 brackets', () => {
  assert.strictEqual(MARGINAL_RATES.length, 6);
});

test('MARGINAL_RATES: rates increase progressively', () => {
  for (let i = 1; i < MARGINAL_RATES.length; i++) {
    assert.ok(MARGINAL_RATES[i].rate > MARGINAL_RATES[i - 1].rate);
  }
});
