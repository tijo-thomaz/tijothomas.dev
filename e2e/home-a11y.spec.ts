// U-08: keyboard walk, axe and target sizes on `/` (HOME-AC-23, HOME-AC-24, HOME-AC-25).
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const VIEWPORTS = [
  { width: 360, height: 740 },
  { width: 1440, height: 900 },
];

// Interactive elements in Tab order: links with href, buttons and form fields, minus tabindex="-1".
const interactiveCount = (page: import('@playwright/test').Page) =>
  page.evaluate(
    () =>
      document.querySelectorAll('a[href]:not([tabindex="-1"]), button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])').length,
  );

test('HOME-AC-23 Tab reaches every interactive element once, each with a visible >= 2px outline (buildings lift), no trap', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const total = await interactiveCount(page);
  expect(total).toBeGreaterThanOrEqual(14);
  const seen: string[] = [];
  const problems: string[] = [];
  for (let i = 0; i < total + 1; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | SVGElement | null;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const inMap = !!el.closest('svg.city-map');
      return {
        id: `${el.tagName}|${el.getAttribute('href') ?? ''}|${el.getAttribute('aria-label') ?? el.textContent?.trim().slice(0, 30)}`,
        outline: cs.outlineStyle !== 'none' ? parseFloat(cs.outlineWidth) : 0,
        lifted: inMap && cs.transform === 'matrix(1, 0, 0, 1, 0, -4)',
      };
    });
    if (!info) break;
    if (seen.includes(info.id)) break; // wrapped around: no trap
    seen.push(info.id);
    await page.waitForTimeout(200); // let the 150 ms lift finish
    const lifted = info.lifted || (await page.evaluate(() => getComputedStyle(document.activeElement as Element).transform === 'matrix(1, 0, 0, 1, 0, -4)'));
    if (info.outline < 2 && !lifted) problems.push(`${info.id}: outline ${info.outline}px, not lifted`);
  }
  expect(seen).toHaveLength(total);
  expect(problems).toEqual([]);
});

for (const vp of VIEWPORTS) {
  test(`HOME-AC-24 axe finds 0 violations on / at ${vp.width}px`, async ({ page }) => {
    await page.setViewportSize(vp);
    await page.goto('/');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}

test('HOME-AC-25 at 360px every link and button is >= 24x24 or has 24px clearance (WCAG 2.5.8)', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/');
  const small = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('a[href], button')) as Element[];
    const rects = els.map((el) => ({ el, r: el.getBoundingClientRect() })).filter(({ r }) => r.width > 0 && r.height > 0);
    const centre = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    return rects
      .filter(({ r }) => r.width < 24 || r.height < 24)
      .filter(({ el, r }) => {
        // Spacing exception: a 24px circle on this target's centre does not touch any other target.
        const c = centre(r);
        return rects.some(({ el: o, r: or }) => {
          if (o === el) return false;
          const dx = Math.max(or.left - c.x, 0, c.x - or.right);
          const dy = Math.max(or.top - c.y, 0, c.y - or.bottom);
          return Math.hypot(dx, dy) < 12;
        });
      })
      .map(({ el, r }) => `${el.tagName} ${el.getAttribute('href') ?? ''} ${Math.round(r.width)}x${Math.round(r.height)}`);
  });
  expect(small).toEqual([]);
});
