import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const SITE = `file://${process.cwd()}/index.html`;

test('homepage loads and has title', async ({ page }) => {
  await page.goto(SITE, { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/TaxFlowAI/);
});
