// U-03 smoke (from U-00): base `/` vs HEAD `/terminal`: load, `help`, theme, chat; screenshots at 1280 and 360.
// Usage: node smoke.cjs <playwright module dir> <outDir> <base url> <head url>   (installed Chrome: PW_CHANNEL=chrome)
const path = require('node:path');
const { chromium } = require(process.argv[2]);
const outDir = process.argv[3];

const targets = [
  ['base', process.argv[4]],
  ['head', process.argv[5]],
];
const viewports = [
  ['desktop-1280', { width: 1280, height: 800 }],
  ['mobile-360', { width: 360, height: 740 }],
];

(async () => {
  const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
  const results = [];
  for (const [name, url] of targets) {
    for (const [vpName, viewport] of viewports) {
      const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 160)));
      const shot = (step) => page.screenshot({ path: path.join(outDir, `${name}-${vpName}-${step}.png`) });
      const r = { name, vp: vpName, steps: {} };
      const resp = await page.goto(url, { waitUntil: 'networkidle' });
      r.status = resp.status();
      await page.waitForTimeout(2500);
      await shot('1-load');

      try {
        const input = page.getByRole('textbox', { name: /Terminal command input/ });
        await input.fill('help');
        await input.press('Enter');
        await page.waitForTimeout(1500);
        r.steps.help = (await page.getByText(/help/i).count()) > 1 ? 'ok' : 'no output';
      } catch (e) { r.steps.help = 'FAIL ' + e.message.split('\n')[0]; }
      await shot('2-help');

      try {
        await page.getByRole('button', { name: /Change theme/ }).first().click();
        const items = page.getByRole('menuitem');
        const n = await items.count();
        const before = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
        await items.nth(n > 1 ? 1 : 0).click();
        await page.waitForTimeout(500);
        const after = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
        r.steps.theme = `menu ${n} items; body bg ${before} -> ${after}`;
      } catch (e) { r.steps.theme = 'FAIL ' + e.message.split('\n')[0]; }
      await shot('3-theme');

      try {
        const trigger = page.locator('div.fixed.cursor-pointer:visible').first();
        await trigger.click({ timeout: 5000 });
        await page.waitForTimeout(1000);
        r.steps.chat = 'trigger clicked';
      } catch (e) { r.steps.chat = 'FAIL ' + e.message.split('\n')[0]; }
      await shot('4-chat');

      r.pageErrors = errors;
      results.push(r);
      await page.close();
    }
  }
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})().catch((e) => { console.error(e); process.exit(1); });
