// TERM-AC-04 (SEC-12): /v2 is a permanent redirect to /terminal (next.config.js redirects()).
import { expect, test } from '@playwright/test';

test('TERM-AC-04 GET /v2 responds 308 with location /terminal', async ({ request }) => {
  const res = await request.get('/v2', { maxRedirects: 0 });
  expect(res.status()).toBe(308);
  expect(res.headers().location).toBe('/terminal');
});

test('TERM-AC-04 following /v2 lands on /terminal with status 200', async ({ page }) => {
  const res = await page.goto('/v2');
  expect(res?.status()).toBe(200);
  expect(new URL(page.url()).pathname).toBe('/terminal');
});

test('TERM-AC-04 TERM-AC-05 the VersionSelector v1 option navigates to /terminal', async ({ page }) => {
  await page.goto('/terminal');
  await page.getByRole('button', { name: /v1\.0\.0/ }).first().click();
  // Already on /terminal, so wait for the navigation request itself, not just the URL.
  const nav = page.waitForRequest((r) => r.isNavigationRequest() && new URL(r.url()).pathname === '/terminal');
  await page.getByRole('heading', { name: 'Interactive Terminal' }).click();
  await nav;
  await expect(page).toHaveURL(/\/terminal$/);
});
