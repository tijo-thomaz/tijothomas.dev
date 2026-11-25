// TERM-AC-06 (U-02): with no Supabase env, /terminal renders and analytics fails soft.
// The Playwright webServer inherits the runner's env, so this spec is only meaningful when the
// whole e2e run has no Supabase env. The first test fails loudly otherwise (never a silent skip).
// From U-02 on, run e2e with an empty Supabase env (the build no longer needs placeholders).
import fs from 'node:fs';
import path from 'node:path';

import { expect, test, type Page } from '@playwright/test';

const SUPABASE = /SUPABASE/i;
const ENV_FILES = ['.env', '.env.local', '.env.production', '.env.production.local'];

function watch(page: Page) {
  const pageErrors: string[] = [];
  const analytics5xx: string[] = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('response', (r) => {
    if (new URL(r.url()).pathname === '/api/analytics' && r.status() >= 500) analytics5xx.push(`${r.request().method()} ${r.status()}`);
  });
  return { pageErrors, analytics5xx };
}

test('TERM-AC-06 guard: the e2e server was started with no Supabase env vars and no .env file', () => {
  expect(Object.keys(process.env).filter((k) => SUPABASE.test(k))).toEqual([]);
  expect(ENV_FILES.filter((f) => fs.existsSync(path.join(process.cwd(), f)))).toEqual([]);
});

test('TERM-AC-06 with no Supabase env /terminal renders, help works, 0 uncaught errors and 0 /api/analytics 5xx', async ({ page }) => {
  const seen = watch(page);
  const res = await page.goto('/terminal');
  expect(res?.status()).toBe(200);
  const input = page.getByRole('textbox', { name: /Terminal command input/ });
  await expect(input).toBeVisible();
  await input.fill('help');
  await input.press('Enter');
  await expect(page.getByText('PORTFOLIO COMMANDS', { exact: false }).first()).toBeVisible();
  await page.waitForLoadState('networkidle');
  expect(seen.analytics5xx).toEqual([]);
  expect(seen.pageErrors).toEqual([]);
});

test('TERM-AC-06 with no Supabase env GET and POST /api/analytics answer 200 JSON (no-op), never 500', async ({ request }) => {
  const get = await request.get('/api/analytics');
  expect(get.status()).toBe(200);
  expect(await get.json()).toMatchObject({ visits: [], usage: [] });
  const post = await request.post('/api/analytics', { data: { type: 'visit' } });
  expect(post.status()).toBe(200);
  expect(typeof (await post.json()).success).toBe('boolean');
});
