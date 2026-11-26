// U-14: /play/<slug> fallback while the demo is not deployed, and the PromptShield redirect.
// The e2e server runs with no SLUICE_ORIGIN, so /play/sluice is the in-site page.
import { expect, test } from '@playwright/test';

test('PROJ-AC-05 PROJ-AC-11 /play/sluice serves "Demo coming soon", links to the case study and is noindex', async ({ page }) => {
  const res = await page.goto('/play/sluice');
  expect(res?.status()).toBe(200);
  expect(res?.headers()['x-robots-tag']).toBe('noindex');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sluice');
  await expect(page.getByText('Demo coming soon')).toBeVisible();
  await expect(page.locator('a[href="/work/sluice"]')).toHaveCount(1);
});

test('PROJ-AC-06 /work/promptshield is a 308 to /work/sluice', async ({ request }) => {
  const res = await request.get('/work/promptshield', { maxRedirects: 0 });
  expect(res.status()).toBe(308);
  expect(res.headers().location).toBe('/work/sluice');
});

test('PROJ-AC-05 an unknown /play slug is a 404', async ({ request }) => {
  expect((await request.get('/play/does-not-exist')).status()).toBe(404);
});
