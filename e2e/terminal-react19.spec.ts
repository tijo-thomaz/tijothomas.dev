// U-02 R1 (critical): the terminal's key interactions under React 19 log 0 console errors, 0 console
// warnings (React warnings included) and 0 uncaught page errors, at 1280 and 360 px.
// Production (`next start`, default config) catches hydration and runtime errors, which React 19
// reports through console.error. React dev warnings (StrictMode double effects, ref and key warnings,
// removed defaultProps/propTypes) only print in development: run the same spec with
// `npx playwright test -c playwright.dev.config.ts` (next dev, scratch worktree only).
import { expect, test, type Page } from '@playwright/test';

function collectConsole(page: Page) {
  const messages: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') messages.push(`[${m.type()}] ${m.text()} @ ${m.location().url}`);
  });
  page.on('pageerror', (e) => messages.push(`[pageerror] ${e.message}`));
  return messages;
}

const zoomKey = (page: Page) => page.evaluate(() => localStorage.getItem('tijothomas-zoom'));

const VIEWPORTS = [
  { name: 'desktop 1280', viewport: { width: 1280, height: 720 } },
  { name: 'mobile 360', viewport: { width: 360, height: 740 } },
];

for (const { name, viewport } of VIEWPORTS) {
  test.describe(name, () => {
    test.use({ viewport });

    // Test double at the platform boundary: @vercel/analytics loads /_vercel/insights/script.js,
    // which only Vercel serves (404 under `next start`), and in dev a debug script from its CDN
    // (no real network in tests). Stubbed as empty JS so the console check sees only app output.
    test.beforeEach(async ({ page }) => {
      const emptyJs = { status: 200, contentType: 'application/javascript', body: '' };
      await page.route('**/_vercel/insights/**', (r) => r.fulfill(emptyJs));
      await page.route('https://va.vercel-scripts.com/**', (r) => r.fulfill(emptyJs));
    });

    test(`U-02 TERM-AC-01 ${name}: help, theme switch, zoom, sound toggle and chat open emit 0 console errors, 0 React warnings, 0 page errors`, async ({ page }) => {
      const messages = collectConsole(page);
      const res = await page.goto('/terminal');
      expect(res?.status()).toBe(200);

      // help
      const input = page.getByRole('textbox', { name: /Terminal command input/ });
      await expect(input).toBeVisible();
      await input.fill('help');
      await input.press('Enter');
      await expect(page.getByText('PORTFOLIO COMMANDS', { exact: false }).first()).toBeVisible();

      // theme switch
      await page.getByRole('button', { name: /Change theme/ }).first().click();
      await page.getByRole('menuitem', { name: /Cyber/ }).click();
      await expect(page.locator('html')).toHaveClass(/\btheme-cyber\b/);

      // zoom in / out / reset (persisted under tijothomas-zoom)
      await page.getByTitle('Zoom In').click();
      await expect.poll(() => zoomKey(page)).toBe('115');
      await page.getByTitle('Zoom Out').click();
      await page.getByTitle('Zoom Out').click();
      await expect.poll(() => zoomKey(page)).toBe('85');
      await page.getByTitle('Reset Zoom').click();
      await expect.poll(() => zoomKey(page)).toBe('100');

      // sound on (plays the notification) and off again
      await page.getByTitle('Enable Sound').click();
      await expect(page.getByTitle('Disable Sound')).toBeVisible();
      await page.getByTitle('Disable Sound').click();
      await expect(page.getByTitle('Enable Sound')).toBeVisible();

      // chat open (the floating trigger has no accessible name; same locator as the U-03 smoke)
      await page.locator('div.fixed.cursor-pointer:visible').first().click();
      await expect(page.getByRole('textbox', { name: /Chat message input/ })).toBeVisible();

      await page.waitForLoadState('networkidle');
      expect(messages.filter((m) => /Warning:|React|hydrat/i.test(m)), 'React warnings or errors').toEqual([]);
      expect(messages).toEqual([]);
    });
  });
}
