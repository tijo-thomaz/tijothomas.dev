// U-08: CSS-only micro-interactions on `/` (HOME-AC-19, HOME-AC-20, HOME-AC-21).
import { expect, test } from '@playwright/test';

const building = (page: import('@playwright/test').Page, name: string) =>
  page.locator(`svg.city-map a[aria-label="${name}"]`);

test('HOME-AC-19 a hovered or focused building lifts by 4px, highlights its label, over 150ms ease-out', async ({ page }) => {
  await page.goto('/');
  const work = building(page, 'Work');
  const style = () =>
    work.evaluate((el) => {
      const cs = getComputedStyle(el);
      const label = el.querySelector('.city-label-bg');
      return {
        transform: cs.transform,
        duration: cs.transitionDuration,
        timing: cs.transitionTimingFunction,
        labelFill: label ? getComputedStyle(label).fill : '',
      };
    });
  const rest = await style();
  expect(rest.duration).toContain('0.15s');
  expect(rest.timing).toContain('ease-out');

  await work.hover();
  await page.waitForTimeout(250);
  const hovered = await style();
  expect(hovered.transform).toBe('matrix(1, 0, 0, 1, 0, -4)');
  expect(hovered.labelFill).not.toBe(rest.labelFill);

  await page.mouse.move(0, 0);
  await work.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(250);
  const focused = await style();
  expect(focused.transform).toBe('matrix(1, 0, 0, 1, 0, -4)');
  expect(focused.labelFill).toBe(hovered.labelFill);
});

test('HOME-AC-20 the car animation runs once for 12000 ms', async ({ page }) => {
  await page.goto('/');
  const anims = await page.evaluate(() =>
    document.getAnimations().map((a) => {
      const t = a.effect?.getTiming();
      const target = (a.effect as KeyframeEffect | null)?.target as Element | null;
      return { car: !!target?.closest('.city-car'), duration: t?.duration, iterations: t?.iterations };
    }),
  );
  expect(anims.filter((a) => a.car)).toEqual([{ car: true, duration: 12000, iterations: 1 }]);
});

test('HOME-AC-20 hovering a work card changes only its border colour', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('#work article').first();
  const snap = () =>
    card.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { border: cs.borderTopColor, transform: cs.transform, shadow: cs.boxShadow, bg: cs.backgroundColor, transition: cs.transitionProperty };
    });
  const before = await snap();
  await card.hover();
  await page.waitForTimeout(250);
  const after = await snap();
  expect(after.border).not.toBe(before.border);
  expect({ ...after, border: '' }).toEqual({ ...before, border: '' });
  expect(before.transition).toBe('border-color');
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('HOME-AC-21 with prefers-reduced-motion there are 0 animations, transitions are <= 0.01s, and focus still highlights', async ({ page }) => {
    await page.goto('/');
    const work = building(page, 'Work');
    const restFill = await work.locator('.city-label-bg').evaluate((el) => getComputedStyle(el).fill);
    await work.hover();
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    const durations = await page.evaluate(() =>
      Array.from(document.querySelectorAll('*')).flatMap((el) =>
        getComputedStyle(el).transitionDuration.split(',').map((d) => parseFloat(d)),
      ),
    );
    expect(durations.filter((d) => d > 0.01)).toEqual([]);
    await page.mouse.move(0, 0);
    await work.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    const focusFill = await work.locator('.city-label-bg').evaluate((el) => getComputedStyle(el).fill);
    expect(focusFill).not.toBe(restFill);
  });
});
