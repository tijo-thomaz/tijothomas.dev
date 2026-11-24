// HOME-AC-06 (U-07): with JavaScript disabled, `/` shows every section, no "Loading" text, and each nav
// anchor scrolls to its target.
import { expect, test } from '@playwright/test';

test.use({ javaScriptEnabled: false });

const SECTIONS = ['top', 'work', 'experience', 'writing', 'contact'];

test('HOME-AC-06 with JS disabled every section is visible and no "Loading" text exists', async ({ page }) => {
  await page.goto('/');
  for (const id of SECTIONS) await expect(page.locator(`#${id}`)).toBeVisible();
  await expect(page.getByRole('region', { name: 'How I work with customers' })).toBeVisible();
  await expect(page.getByText(/Loading/i)).toHaveCount(0);
});

test('HOME-AC-06 HOME-AC-09 with JS disabled each nav anchor scrolls its target into view', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Main' });
  for (const id of ['work', 'experience', 'writing', 'contact']) {
    await nav.locator(`a[href="#${id}"]`).click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#${id}`)).toBeInViewport();
  }
});
