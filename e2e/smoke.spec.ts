// U-01 walking-skeleton smoke: proves build -> next start -> Playwright works end to end on the
// current `/` terminal. U-03 renames it to cite the /terminal AC once the terminal moves there.
import { expect, test } from '@playwright/test';

test('U-01 smoke: / serves the terminal and answers the help command with no page errors', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));

  const response = await page.goto('/');
  expect(response?.status()).toBe(200);

  const input = page.getByRole('textbox', { name: /Terminal command input/ });
  await expect(input).toBeVisible();
  await input.fill('help');
  await input.press('Enter');

  await expect(page.getByText('PORTFOLIO COMMANDS', { exact: false }).first()).toBeVisible();
  expect(pageErrors).toEqual([]);
});
