// U-10: the privacy notice in the production build (HOME-AC-27, HOME-AC-28) and the terminal modal
// (TERM-AC-12).
import { expect, test } from '@playwright/test';

test('HOME-AC-27 the footer of / links to /privacy', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
});

test('HOME-AC-28 /privacy without JS: 200, one h1, the required topics, a LinkedIn contact and no email', async ({ request }) => {
  const res = await request.get('/privacy');
  expect(res.status()).toBe(200);
  const html = await res.text();
  expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
  const text = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ');
  for (const topic of [/Vercel/, /request logs?/i, /Web Analytics/, /Supabase/, /tijothomas-theme/, /portfolio-analytics/, /supervisory authority/i, /retention|kept/i, /rights/i]) {
    expect(text).toMatch(topic);
  }
  expect(html).toContain('href="https://www.linkedin.com/in/tijo-j-thomaz93/"');
  expect(html).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|mailto:/i);
});

test('TERM-AC-12 the terminal privacy modal links to /privacy and makes no inaccurate claims', async ({ page }) => {
  await page.goto('/terminal');
  await page.getByRole('button', { name: 'Privacy Notice' }).click();
  await expect(page.locator('a[href="/privacy"]')).toBeVisible();
  const text = await page.locator('body').innerText();
  expect(text).not.toContain('No IP Tracking');
  expect(text).not.toContain('Data stays in your browser');
  expect(text).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
});
