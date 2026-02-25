import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSolidarityCredit,
  calculateWorkPremium,
  calculateCWB,
} from '../credit-calculator.js';

// Solidarity Credit Tests
test('calculateSolidarityCredit returns number', () => {
  const s = calculateSolidarityCredit(30000);
  assert.strictEqual(typeof s, 'number');
});

test('calculateSolidarityCredit: full credit below phaseout', () => {
  const credit = calculateSolidarityCredit(50000, true);
  assert.strictEqual(credit, 531);
});

test('calculateSolidarityCredit: zero credit above phaseout', () => {
  const credit = calculateSolidarityCredit(65000, true);
  assert.strictEqual(credit, 0);
});

test('calculateSolidarityCredit: partial credit during phaseout', () => {
  const credit = calculateSolidarityCredit(61000, true);
  assert.ok(credit > 0 && credit < 531);
});

test('calculateSolidarityCredit: couple gets double base', () => {
  const single = calculateSolidarityCredit(40000, true);
  const couple = calculateSolidarityCredit(40000, false);
  assert.strictEqual(couple, single * 2);
});

// Work Premium Tests
test('calculateWorkPremium returns number', () => {
  const w = calculateWorkPremium(25000);
  assert.strictEqual(typeof w, 'number');
});

test('calculateWorkPremium: zero below threshold', () => {
  const credit = calculateWorkPremium(5000);
  assert.strictEqual(credit, 0);
});

test('calculateWorkPremium: zero above income limit', () => {
  const credit = calculateWorkPremium(60000);
  assert.strictEqual(credit, 0);
});

test('calculateWorkPremium: capped at max for single', () => {
  const credit = calculateWorkPremium(50000, true);
  assert.strictEqual(credit, 728);
});

test('calculateWorkPremium: higher max with dependents', () => {
  const single = calculateWorkPremium(50000, true);
  const family = calculateWorkPremium(50000, false);
  assert.ok(family > single);
});

// Canada Workers Benefit Tests
test('calculateCWB returns number', () => {
  const c = calculateCWB(20000);
  assert.strictEqual(typeof c, 'number');
});

test('calculateCWB: phase-in below $17,576', () => {
  const credit = calculateCWB(5000, false);
  // 27% of 5000 = 1350, which is less than max 1519
  assert.ok(credit > 0 && credit < 1519);
});

test('calculateCWB: full benefit in plateau range', () => {
  const credit = calculateCWB(20000, false);
  assert.strictEqual(credit, 1519);
});

test('calculateCWB: phase-out reduces benefit', () => {
  const credit = calculateCWB(30000, false);
  assert.ok(credit > 0 && credit < 1519);
});

test('calculateCWB: zero above phaseout', () => {
  const credit = calculateCWB(40000, false);
  assert.strictEqual(credit, 0);
});

test('calculateCWB: higher max with dependents', () => {
  const single = calculateCWB(20000, false);
  const family = calculateCWB(20000, true);
  assert.ok(family > single);
});
