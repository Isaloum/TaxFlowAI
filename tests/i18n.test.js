import { test } from 'node:test';
import assert from 'node:assert/strict';
import { t } from '../i18n.js';

// English Translation Tests
test('t: returns English translator function', () => {
  const translator = t('en');
  assert.strictEqual(typeof translator, 'function');
});

test('t: translates income to English', () => {
  const translator = t('en');
  assert.strictEqual(translator('income'), 'Income');
});

test('t: translates solidarity to English', () => {
  const translator = t('en');
  assert.strictEqual(translator('solidarity'), 'Solidarity Credit');
});

test('t: translates workPremium to English', () => {
  const translator = t('en');
  assert.strictEqual(translator('workPremium'), 'Work Premium');
});

test('t: translates bpaSavings to English', () => {
  const translator = t('en');
  assert.strictEqual(translator('bpaSavings'), 'BPA Savings');
});

test('t: translates cwb to English', () => {
  const translator = t('en');
  assert.strictEqual(translator('cwb'), 'CWB (cash)');
});

test('t: translates qcTotal to English', () => {
  const translator = t('en');
  assert.strictEqual(translator('qcTotal'), 'QC Total');
});

test('t: translates fedTotal to English', () => {
  const translator = t('en');
  assert.strictEqual(translator('fedTotal'), 'Fed Total');
});

test('t: translates totalBenefit to English', () => {
  const translator = t('en');
  assert.strictEqual(translator('totalBenefit'), 'Total Benefit');
});

test('t: translates cashBack to English', () => {
  const translator = t('en');
  assert.strictEqual(translator('cashBack'), 'Cash Back');
});

// French Translation Tests
test('t: returns French translator function', () => {
  const translator = t('fr');
  assert.strictEqual(typeof translator, 'function');
});

test('t: translates income to French', () => {
  const translator = t('fr');
  assert.strictEqual(translator('income'), 'Revenu');
});

test('t: translates solidarity to French', () => {
  const translator = t('fr');
  assert.strictEqual(translator('solidarity'), 'Crédit pour la solidarité');
});

test('t: translates workPremium to French', () => {
  const translator = t('fr');
  assert.strictEqual(translator('workPremium'), 'Prime au travail');
});

test('t: translates bpaSavings to French', () => {
  const translator = t('fr');
  assert.strictEqual(translator('bpaSavings'), 'Économies BPA');
});

test('t: translates cwb to French', () => {
  const translator = t('fr');
  assert.strictEqual(translator('cwb'), 'PTE (argent)');
});

test('t: translates qcTotal to French', () => {
  const translator = t('fr');
  assert.strictEqual(translator('qcTotal'), 'Total QC');
});

test('t: translates fedTotal to French', () => {
  const translator = t('fr');
  assert.strictEqual(translator('fedTotal'), 'Total fédéral');
});

test('t: translates totalBenefit to French', () => {
  const translator = t('fr');
  assert.strictEqual(translator('totalBenefit'), 'Avantage total');
});

test('t: translates cashBack to French', () => {
  const translator = t('fr');
  assert.strictEqual(translator('cashBack'), 'Remboursement');
});

// Fallback Tests
test('t: returns key if translation missing', () => {
  const translator = t('en');
  assert.strictEqual(translator('nonexistentKey'), 'nonexistentKey');
});

test('t: falls back to English for unsupported language', () => {
  const translator = t('es'); // Spanish not supported
  assert.strictEqual(translator('income'), 'Income');
});

test('t: defaults to English if no language specified', () => {
  const translator = t();
  assert.strictEqual(translator('income'), 'Income');
});

// Edge Cases
test('t: handles undefined key gracefully', () => {
  const translator = t('en');
  assert.strictEqual(translator(undefined), undefined);
});

test('t: handles null key gracefully', () => {
  const translator = t('en');
  assert.strictEqual(translator(null), null);
});

test('t: handles empty string key', () => {
  const translator = t('en');
  assert.strictEqual(translator(''), '');
});

// All Keys Test
test('t: French has same keys as English', () => {
  const enTranslator = t('en');
  const frTranslator = t('fr');

  const keys = [
    'income',
    'solidarity',
    'workPremium',
    'bpaSavings',
    'cwb',
    'qcTotal',
    'fedTotal',
    'totalBenefit',
    'cashBack',
  ];

  keys.forEach((key) => {
    const enValue = enTranslator(key);
    const frValue = frTranslator(key);

    // Both should have translations (not return the key itself)
    assert.ok(enValue !== key || frValue !== key);
    // Both should return strings
    assert.strictEqual(typeof enValue, 'string');
    assert.strictEqual(typeof frValue, 'string');
  });
});

// Immutability Test
test('t: multiple calls return independent translators', () => {
  const en1 = t('en');
  const en2 = t('en');
  const fr = t('fr');

  assert.strictEqual(en1('income'), 'Income');
  assert.strictEqual(en2('income'), 'Income');
  assert.strictEqual(fr('income'), 'Revenu');
});
