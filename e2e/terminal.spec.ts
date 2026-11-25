// /terminal e2e against `next build && next start` (U-03). The terminal moved from `/` to
// `/terminal` without behaviour change; these pin what still has to work there.
import { expect, test, type Page } from '@playwright/test';

const THEME_KEY = 'tijothomas-theme';

function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

async function runCommand(page: Page, cmd: string) {
  const input = page.getByRole('textbox', { name: /Terminal command input/ });
  await expect(input).toBeVisible();
  await input.fill(cmd);
  await input.press('Enter');
}

test('TERM-AC-01 /terminal returns 200, help prints the help output, and 0 uncaught errors are thrown', async ({ page }) => {
  const errors = collectPageErrors(page);
  const response = await page.goto('/terminal');
  expect(response?.status()).toBe(200);
  await runCommand(page, 'help');
  await expect(page.getByText('PORTFOLIO COMMANDS', { exact: false }).first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('TERM-AC-02 a theme chosen on /terminal persists across reload via localStorage tijothomas-theme', async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.goto('/terminal');
  await page.getByRole('button', { name: /Change theme/ }).first().click();
  await page.getByRole('menuitem', { name: /Cyber/ }).click();
  await expect.poll(() => page.evaluate((k) => localStorage.getItem(k), THEME_KEY)).toBe('cyber');

  await page.reload();
  await expect(page.locator('html')).toHaveClass(/\btheme-cyber\b/);
  expect(await page.evaluate((k) => localStorage.getItem(k), THEME_KEY)).toBe('cyber');
  expect(errors).toEqual([]);
});

test('TERM-AC-03 /terminal HTML has robots noindex, follow and canonical https://tijothomas.dev/terminal', async ({ request }) => {
  const res = await request.get('/terminal');
  expect(res.status()).toBe(200);
  const html = await res.text();
  expect(html).toMatch(/<meta name="robots" content="noindex, follow"\s*\/?>/);
  expect(html).toMatch(/<link rel="canonical" href="https:\/\/tijothomas\.dev\/terminal"\s*\/?>/);
});

test('U-03 /terminal is served by the terminal root layout (font-mono body)', async ({ page }) => {
  const res = await page.goto('/terminal');
  expect(res?.status()).toBe(200);
  const body = await page.locator('body').getAttribute('class');
  expect(body ?? '').toMatch(/font-mono/);
});
