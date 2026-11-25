// U-11: the site CSP breaks nothing. Pages load with 0 securitypolicyviolation events, and the Vercel
// Analytics script (first-party path) is still requested.
import { expect, test, type Page } from '@playwright/test';

async function collectViolations(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __cspViolations: string[] }).__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      (window as unknown as { __cspViolations: string[] }).__cspViolations.push(`${e.violatedDirective} ${e.blockedURI}`);
    });
  });
  return () => page.evaluate(() => (window as unknown as { __cspViolations: string[] }).__cspViolations);
}

test('PLAT-AC-20 PLAT-AC-24 / loads with 0 CSP violations and requests /_vercel/insights/script.js', async ({ page }) => {
  const violations = await collectViolations(page);
  const analytics = page.waitForRequest((r) => new URL(r.url()).pathname === '/_vercel/insights/script.js', { timeout: 15_000 });
  await page.goto('/');
  await analytics;
  await page.waitForLoadState('networkidle');
  expect(await violations()).toEqual([]);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

for (const path of ['/privacy', '/work/promptshield', '/terminal']) {
  test(`PLAT-AC-22 PLAT-AC-21 ${path} loads with 0 CSP violations and 0 page errors`, async ({ page }) => {
    const violations = await collectViolations(page);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    expect(await violations()).toEqual([]);
    expect(errors).toEqual([]);
  });
}
