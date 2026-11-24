// TERM-AC-07, TERM-AC-08 (U-04, SQ-01 c, ADR-P2): the chat route is gone and the chat UI degrades
// to a fixed "chat unavailable" reply with no request and no uncaught error.
import { expect, test } from '@playwright/test';

import { CHAT_UNAVAILABLE_MESSAGE } from '../src/terminal/features/chat-assistant/model/chatUnavailable';

const emptyJs = { status: 200, contentType: 'application/javascript', body: '' };

test('TERM-AC-07 GET and POST /api/chat answer 404 or 410 (route removed)', async ({ request }) => {
  const get = await request.get('/api/chat');
  expect([404, 410]).toContain(get.status());
  const post = await request.post('/api/chat', { data: { message: 'hi' } });
  expect([404, 410]).toContain(post.status());
});

test('TERM-AC-08 opening the chat and sending a message shows the unavailable text, sends no /api/chat request and logs 0 uncaught errors', async ({ page }) => {
  await page.route('**/_vercel/insights/**', (r) => r.fulfill(emptyJs));
  await page.route('https://va.vercel-scripts.com/**', (r) => r.fulfill(emptyJs));
  const pageErrors: string[] = [];
  const chatRequests: string[] = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('request', (r) => { if (new URL(r.url()).pathname.startsWith('/api/chat')) chatRequests.push(r.method()); });

  await page.goto('/terminal');
  await expect(page.getByRole('textbox', { name: /Terminal command input/ })).toBeVisible();
  // The floating trigger has no accessible name (carried to the terminal a11y unit); same locator as the U-03 smoke.
  await page.locator('div.fixed.cursor-pointer:visible').first().click();
  const chatInput = page.getByRole('textbox', { name: /Chat message input/ });
  await expect(chatInput).toBeVisible();
  await chatInput.fill('What does Tijo work on?');
  await chatInput.press('Enter');
  await expect(page.getByText(CHAT_UNAVAILABLE_MESSAGE, { exact: false }).first()).toBeVisible();
  await page.waitForLoadState('networkidle');
  expect(chatRequests).toEqual([]);
  expect(pageErrors).toEqual([]);
});
