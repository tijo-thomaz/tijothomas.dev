// U-11: the site CSP breaks nothing. Pages load with 0 securitypolicyviolation events, and the Vercel
// Analytics script (first-party path) is still requested.
import { expect, test, type Page } from '@playwright/test';

// Same-origin subresources that fail to load (e.g. upgraded to https by upgrade-insecure-requests on a
// plain-http origin) are not CSP violation events; record them separately (U-11 review #4).
// Exempt: /_vercel/insights/* exists only on Vercel. Under `next start` it is an HTML 404, which the
// browser refuses to run as a script because of `nosniff` (ERR_ABORTED) - correct behaviour, not a bug.
const OFF_VERCEL_ONLY = /^\/_vercel\/insights\//;
function collectFailedRequests(page: Page, baseURL: string | undefined) {
  const { hostname } = new URL(baseURL ?? 'http://127.0.0.1');
  const failed: string[] = [];
  page.on('requestfailed', (r) => {
    const url = new URL(r.url());
    if (url.hostname === hostname && !OFF_VERCEL_ONLY.test(url.pathname)) {
      failed.push(`${r.url()} ${r.failure()?.errorText ?? ''}`);
    }
  });
  return failed;
}

async function collectViolations(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __cspViolations: string[] }).__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      (window as unknown as { __cspViolations: string[] }).__cspViolations.push(`${e.violatedDirective} ${e.blockedURI}`);
    });
  });
  return () => page.evaluate(() => (window as unknown as { __cspViolations: string[] }).__cspViolations);
}

test('PLAT-AC-20 PLAT-AC-24 / loads with 0 CSP violations, 0 failed same-origin requests, and requests /_vercel/insights/script.js', async ({ page, baseURL }) => {
  const violations = await collectViolations(page);
  const failed = collectFailedRequests(page, baseURL);
  const analytics = page.waitForRequest((r) => new URL(r.url()).pathname === '/_vercel/insights/script.js', { timeout: 15_000 });
  await page.goto('/');
  await analytics;
  await page.waitForLoadState('networkidle');
  expect(await violations()).toEqual([]);
  expect(failed).toEqual([]);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

for (const path of ['/privacy', '/projects', '/work/sluice', '/play/sluice', '/writing/queues-double-charge', '/terminal']) {
  test(`PLAT-AC-22 PLAT-AC-21 ${path} loads with 0 CSP violations, 0 failed same-origin requests and 0 page errors`, async ({ page, baseURL }) => {
    const violations = await collectViolations(page);
    const failed = collectFailedRequests(page, baseURL);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    expect(await violations()).toEqual([]);
    expect(failed).toEqual([]);
    expect(errors).toEqual([]);
  });
}
