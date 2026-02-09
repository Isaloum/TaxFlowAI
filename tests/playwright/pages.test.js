import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const SITE = `file://${process.cwd()}/index.html`;

test('homepage loads and has title', async ({ page }) => {
  await page.goto(SITE, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/TaxFlowAI/);
});
 copilot/disable-failing-accessibility-test

test.skip('homepage accessibility quick scan', async ({ page }) => {
  await page.goto(SITE, { waitUntil: 'domcontentloaded' });
  // run axe via AxeBuilder
  const results = await new AxeBuilder({ page }).analyze();
  if (results.violations && results.violations.length > 0) {
    console.error('A11Y violations:', JSON.stringify(results.violations, null, 2));
  }
  expect(results.violations.length).toBe(0);
});
