// U-08: CSS-only micro-interactions on `/` (HOME-AC-19, HOME-AC-20, HOME-AC-21).
import { expect, test } from '@playwright/test';

const building = (page: import('@playwright/test').Page, name: string) =>
  page.locator(`svg.city-map a[aria-label="${name}"]`);

test('HOME-AC-19 a hovered or focused building lifts by 4px, highlights its label, over 150ms ease-out', async ({ page }) => {
  await page.goto('/');
  const work = building(page, 'Work');
  // The building's body lifts (not the link's hit area); the label bubble is the rect.
  const style = () =>
    work.evaluate((el) => {
      const body = el.querySelector('.city-building-body') as Element;
      const label = el.querySelector('rect.city-label-bg') as Element;
      const cs = getComputedStyle(body);
      return {
        transform: cs.transform,
        duration: cs.transitionDuration,
        timing: cs.transitionTimingFunction,
        labelFill: getComputedStyle(label).fill,
      };
    });
  const rest = await style();
  expect(rest.duration).toContain('0.15s');
  expect(rest.timing).toContain('ease-out');
  expect(rest.transform).toBe('none');

  await work.hover();
  await expect.poll(async () => (await style()).transform).toBe('matrix(1, 0, 0, 1, 0, -4)');
  const hovered = await style();
  expect(hovered.labelFill).not.toBe(rest.labelFill);

  await page.mouse.move(0, 0);
  await expect.poll(async () => (await style()).transform).toBe('none');
  await work.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect.poll(async () => (await style()).transform).toBe('matrix(1, 0, 0, 1, 0, -4)');
  expect((await style()).labelFill).toBe(hovered.labelFill);
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
  await expect.poll(async () => (await snap()).border).not.toBe(before.border);
  const after = await snap();
  expect({ ...after, border: '' }).toEqual({ ...before, border: '' });
  expect(before.transition).toBe('border-color');
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('HOME-AC-21 with prefers-reduced-motion there are 0 animations, transitions are <= 0.01s, and focus still highlights', async ({ page }) => {
    await page.goto('/');
    const work = building(page, 'Work');
    const label = work.locator('rect.city-label-bg'); // the bubble; its pointer path shares the class
    const restFill = await label.evaluate((el) => getComputedStyle(el).fill);
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
    const focusFill = await label.evaluate((el) => getComputedStyle(el).fill);
    expect(focusFill).not.toBe(restFill);
  });
});
