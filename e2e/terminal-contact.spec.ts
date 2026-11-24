// TERM-AC-11 (U-04, SQ-05 a): `contact` lists LinkedIn and GitHub; the terminal page holds no email
// address, phone number, mailto:, tel: or wa.me link anywhere in its DOM.
import { expect, test } from '@playwright/test';

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE = /\+\d[\d\s().-]{8,}\d/;

test('TERM-AC-11 contact lists the LinkedIn and GitHub URLs and the page has no email, phone or wa.me link', async ({ page }) => {
  await page.goto('/terminal');
  const input = page.getByRole('textbox', { name: /Terminal command input/ });
  await expect(input).toBeVisible();
  await input.fill('contact');
  await input.press('Enter');
  await expect(page.getByText(/linkedin\.com\/in\/tijo-j-thomaz93/).first()).toBeVisible();
  await expect(page.getByText(/github\.com\/tijo-thomaz\b/).first()).toBeVisible();

  const html = await page.content();
  expect(html.match(EMAIL)?.[0] ?? null).toBeNull();
  expect(html.match(PHONE)?.[0] ?? null).toBeNull();
  expect(html).not.toMatch(/mailto:|\btel:|wa\.me/i);
});
