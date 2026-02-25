import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseIncomeSlip } from '../income-slip-parser.js';

// RL-1 (Quebec) Parsing Tests
test('parseIncomeSlip: detects RL-1 format', () => {
  const text = 'Box A: 50000';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.source, 'RL-1');
});

test('parseIncomeSlip: extracts RL-1 employment income (Box A)', () => {
  const text = 'Box A: 50000.00';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.employmentIncome, 50000);
});

test('parseIncomeSlip: extracts RL-1 QPP contributions (Box B.A)', () => {
  const text = 'Box A: 50000 Box B.A: 3500.00';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.qpp, 3500);
});

test('parseIncomeSlip: extracts RL-1 EI premiums (Box C)', () => {
  const text = 'Box A: 50000 Box C: 950.00';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.ei, 950);
});

test('parseIncomeSlip: extracts RL-1 PPIP premiums (Box H)', () => {
  const text = 'Box A: 50000 Box H: 450.00';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.ppip, 450);
});

test('parseIncomeSlip: extracts RL-1 union dues (Box F)', () => {
  const text = 'Box A: 50000 Box F: 500.00';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.unionDues, 500);
});

test('parseIncomeSlip: handles Case notation for RL-1', () => {
  const text = 'Case A: 50000';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.source, 'RL-1');
  assert.strictEqual(result.employmentIncome, 50000);
});

test('parseIncomeSlip: handles numbers with commas', () => {
  const text = 'Box A: 50,000.00';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.employmentIncome, 50000);
});

// T4 (Federal) Parsing Tests
test('parseIncomeSlip: detects T4 format', () => {
  const text = 'Box 14: 50000';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.source, 'T4');
});

test('parseIncomeSlip: extracts T4 employment income (Box 14)', () => {
  const text = 'Box 14: 50000.00';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.employmentIncome, 50000);
});

test('parseIncomeSlip: extracts T4 CPP contributions (Box 16)', () => {
  const text = 'Box 14: 50000 Box 16: 3500.00';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.cpp, 3500);
});

test('parseIncomeSlip: extracts T4 QPP contributions (Box 17)', () => {
  const text = 'Box 14: 50000 Box 17: 3500.00';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.qpp, 3500);
});

test('parseIncomeSlip: extracts T4 EI premiums (Box 18)', () => {
  const text = 'Box 14: 50000 Box 18: 950.00';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.ei, 950);
});

test('parseIncomeSlip: extracts T4 PPIP premiums (Box 55)', () => {
  const text = 'Box 14: 50000 Box 55: 450.00';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.ppip, 450);
});

test('parseIncomeSlip: extracts T4 union dues (Box 44)', () => {
  const text = 'Box 14: 50000 Box 44: 500.00';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.unionDues, 500);
});

// SIN Parsing Tests
test('parseIncomeSlip: extracts SIN with dashes', () => {
  const text = 'Box 14: 50000 SIN: 123-456-789';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.sin, '123456789');
});

test('parseIncomeSlip: extracts SIN with spaces', () => {
  const text = 'Box 14: 50000 SIN: 123 456 789';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.sin, '123456789');
});

test('parseIncomeSlip: extracts SIN without separators', () => {
  const text = 'Box 14: 50000 SIN: 123456789';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.sin, '123456789');
});

test('parseIncomeSlip: handles SIN with periods (S.I.N.)', () => {
  const text = 'Box 14: 50000 S.I.N.: 123-456-789';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.sin, '123456789');
});

// Validation Tests
test('parseIncomeSlip: isValid returns true for valid income', () => {
  const text = 'Box 14: 50000';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.isValid(), true);
});

test('parseIncomeSlip: isValid returns false for zero income', () => {
  const text = 'Box 14: 0';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.isValid(), false);
});

test('parseIncomeSlip: isValid returns false for no income', () => {
  const text = 'Some random text';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.isValid(), false);
});

// Warnings Tests
test('parseIncomeSlip: warns about missing union dues in RL-1', () => {
  const text = 'Box A: 50000';
  const result = parseIncomeSlip(text);
  const warnings = result.warnings();
  assert.ok(warnings.some((w) => w.includes('syndicales')));
});

test('parseIncomeSlip: warns about missing union dues in T4', () => {
  const text = 'Box 14: 50000';
  const result = parseIncomeSlip(text);
  const warnings = result.warnings();
  assert.ok(warnings.some((w) => w.includes('Union dues')));
});

test('parseIncomeSlip: warns about missing SIN', () => {
  const text = 'Box 14: 50000';
  const result = parseIncomeSlip(text);
  const warnings = result.warnings();
  assert.ok(warnings.some((w) => w.includes('NAS') || w.includes('SIN')));
});

test('parseIncomeSlip: no warnings when all fields present', () => {
  const text = 'Box 14: 50000 Box 44: 500 SIN: 123456789';
  const result = parseIncomeSlip(text);
  const warnings = result.warnings();
  assert.strictEqual(warnings.length, 0);
});

// Edge Cases
test('parseIncomeSlip: handles unknown format', () => {
  const text = 'Random text without slip data';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.source, 'Unknown');
});

test('parseIncomeSlip: handles extra whitespace', () => {
  const text = '  Box   14:   50000.00  ';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.employmentIncome, 50000);
});

test('parseIncomeSlip: handles multiple boxes on same line', () => {
  const text = 'Box 14: 50000 Box 16: 3500 Box 18: 950 Box 44: 500 SIN: 123456789';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.employmentIncome, 50000);
  assert.strictEqual(result.cpp, 3500);
  assert.strictEqual(result.ei, 950);
  assert.strictEqual(result.unionDues, 500);
  assert.strictEqual(result.sin, '123456789');
});

test('parseIncomeSlip: returns null for missing fields', () => {
  const text = 'Box 14: 50000';
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.cpp, null);
  assert.strictEqual(result.unionDues, null);
});

// Real-world Format Tests
test('parseIncomeSlip: handles realistic RL-1 format', () => {
  const text = `
    RELEVÉ 1 - Revenu d'emploi
    Année d'imposition: 2025
    Box A: 65,000.00
    Box B.A: 3,867.50
    Box C: 1,048.70
    Box H: 392.00
    Box F: 600.00
    SIN: 123-456-789
  `;
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.source, 'RL-1');
  assert.strictEqual(result.employmentIncome, 65000);
  assert.strictEqual(result.qpp, 3867.5);
  assert.strictEqual(result.ei, 1048.7);
  assert.strictEqual(result.ppip, 392);
  assert.strictEqual(result.unionDues, 600);
  assert.strictEqual(result.sin, '123456789');
  assert.strictEqual(result.isValid(), true);
  assert.strictEqual(result.warnings().length, 0);
});

test('parseIncomeSlip: handles realistic T4 format', () => {
  const text = `
    T4 Statement of Remuneration Paid
    Tax Year: 2025
    Box 14: 65,000.00
    Box 16: 3,867.50
    Box 18: 1,048.70
    Box 44: 600.00
    S.I.N.: 123-456-789
  `;
  const result = parseIncomeSlip(text);
  assert.strictEqual(result.source, 'T4');
  assert.strictEqual(result.employmentIncome, 65000);
  assert.strictEqual(result.cpp, 3867.5);
  assert.strictEqual(result.ei, 1048.7);
  assert.strictEqual(result.unionDues, 600);
  assert.strictEqual(result.sin, '123456789');
  assert.strictEqual(result.isValid(), true);
  assert.strictEqual(result.warnings().length, 0);
});
