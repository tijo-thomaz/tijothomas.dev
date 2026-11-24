// U-08: first viewport and horizontal overflow on `/` (HOME-AC-07, HOME-AC-22).
import { expect, test } from '@playwright/test';

for (const vp of [
  { width: 360, height: 740 },
  { width: 1440, height: 900 },
]) {
  test(`HOME-AC-07 at ${vp.width}x${vp.height} the location line, h1, intro and "View work" start in the first viewport`, async ({ page }) => {
    await page.setViewportSize(vp);
    await page.goto('/');
    for (const sel of ['.hero-line', 'h1', '.hero-intro', '.btn--accent']) {
      const top = await page.locator(sel).first().evaluate((el) => el.getBoundingClientRect().top);
      expect(top, sel).toBeLessThan(vp.height);
    }
  });
}

test('HOME-AC-22 at 360x740, scrolled to the end, the page is no wider than the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});

test('HOME-AC-10 the CityMap reserves its space before paint (no layout shift from the svg)', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const ratio = await page.locator('svg.city-map').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return r.height / r.width;
  });
  expect(ratio).toBeCloseTo(794 / 837, 2);
});
