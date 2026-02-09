import { test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('get violations', async ({ page }) => {
  await page.goto(`file://${process.cwd()}/index.html`, { waitUntil: 'domcontentloaded' });
  const results = await new AxeBuilder({ page }).analyze();
  console.log('=== VIOLATIONS ===');
  console.log(JSON.stringify(results.violations, null, 2));
});
