// Walking-skeleton smoke (U-01, retargeted in U-03): both route groups build and serve. The
// behavioural checks live in terminal.spec.ts, v2-redirect.spec.ts and site-home.spec.ts.
import { expect, test } from '@playwright/test';

for (const route of ['/', '/terminal']) {
  test(`U-03 smoke: ${route} responds 200 with no uncaught page errors`, async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await page.waitForLoadState('networkidle');
    expect(pageErrors).toEqual([]);
  });
}
