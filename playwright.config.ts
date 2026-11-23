// Playwright e2e harness (U-01 walking skeleton). Runs e2e/ against a production build
// (`next build && next start`), never against `next dev`. Not part of `npm test`.
//
// Port: E2E_PORT, else a free port picked once here and passed to workers through the env.
// Never 3100 (the owner's `next dev`). The build writes .next/, so run `npm run test:e2e` from a
// scratch git worktree while a dev server is running in the main checkout.
// Browser: PW_CHANNEL=chrome (or msedge) uses an installed browser instead of Playwright's Chromium.
import { execFileSync } from 'node:child_process';

import { defineConfig, devices } from '@playwright/test';

const RESERVED_PORTS = new Set([3000, 3100]);

function freePort(): string {
  const script = "const s=require('net').createServer();s.listen(0,'127.0.0.1',()=>{console.log(s.address().port);s.close();});";
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const port = execFileSync(process.execPath, ['-e', script], { encoding: 'utf8' }).trim();
    if (!RESERVED_PORTS.has(Number(port))) return port;
  }
  throw new Error('playwright.config.ts: no free port found');
}

process.env.E2E_PORT ??= freePort();
const port = process.env.E2E_PORT;
const origin = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: origin,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], ...(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}) },
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${port} -H 127.0.0.1`,
    url: origin,
    reuseExistingServer: false,
    timeout: 300_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
