import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';

const SITE = 'https://isaloum.github.io/TaxSyncQC/';

test('homepage loads and has title', async ({ page }) => {
  await page.goto(SITE, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/TaxSyncQC/);
});

test('homepage accessibility quick scan', async ({ page }) => {
  await page.goto(SITE, { waitUntil: 'domcontentloaded' });
  await injectAxe(page);
  await checkA11y(page);
});
