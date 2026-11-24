// U-07 owner request: no text-selection (I-beam) cursor over titles, text, badges or button labels on
// the new site pages. The arrow is the default, and links and buttons show the hand. The terminal is
// out of scope (owner: "ignore terminal").
import { expect, test } from '@playwright/test';

const cursorOf = (page: import('@playwright/test').Page, selector: string) =>
  page.locator(selector).first().evaluate((el) => getComputedStyle(el).cursor);

test('U-07 / shows the arrow over headings, text, badges and tiles, and the hand over links', async ({ page }) => {
  await page.goto('/');
  for (const sel of ['h1', 'h2', '.hero-intro', '.tile-value', '.badge', '.monogram', '.step-number', '.post-title']) {
    expect(await cursorOf(page, sel), sel).toBe('default');
  }
  for (const sel of ['.nav-link', '.btn--accent', '.contact-link', '.footer-link']) {
    expect(await cursorOf(page, sel), sel).toBe('pointer');
  }
});
