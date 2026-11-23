// `/` after U-03: a hello-world page rendered by the (site) root layout. The terminal, its toolbar
// and its widgets live only under /terminal (route-group bulkhead).
import { expect, test } from '@playwright/test';

test('HOME-AC-05 with localStorage tijothomas-theme=cyber, / renders <html> with no theme-* class', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('tijothomas-theme', 'cyber'));
  const res = await page.goto('/');
  expect(res?.status()).toBe(200);
  await page.waitForLoadState('networkidle');
  const cls = (await page.locator('html').getAttribute('class')) ?? '';
  expect(cls).not.toMatch(/\btheme-/);
});

test('U-03 / is the hello-world site page: 200, lang en, exactly one main, 0 uncaught errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const res = await page.goto('/');
  expect(res?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('main')).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('U-03 / has no terminal input, toolbar controls, version selector, chat trigger or hidden SEO block', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('textbox', { name: /Terminal command input/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Change theme|zoom|sound|1\.0\.0/i })).toHaveCount(0);
  await expect(page.locator('.seo-content')).toHaveCount(0);
  await expect(page.locator('div.fixed.cursor-pointer')).toHaveCount(0);
});

test('U-03 / does not set the terminal theme key in localStorage', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(await page.evaluate(() => localStorage.getItem('tijothomas-theme'))).toBeNull();
});
