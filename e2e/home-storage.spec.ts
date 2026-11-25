// HOME-AC-26 (U-06): `/` stores nothing in the visitor's browser: no cookies, no web storage.
import { expect, test } from '@playwright/test';

test('HOME-AC-26 a fresh context loading / has 0 cookies, empty document.cookie and empty local/session storage', async ({ page, context, baseURL }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const state = await page.evaluate(() => ({
    cookie: document.cookie,
    local: localStorage.length,
    session: sessionStorage.length,
  }));
  expect(state).toEqual({ cookie: '', local: 0, session: 0 });
  expect(await context.cookies(baseURL)).toEqual([]);
});

test('HOME-AC-01 HOME-AC-11 / renders the headline h1 and the skip link as the first Tab stop', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveAttribute('href', '#main');
});
