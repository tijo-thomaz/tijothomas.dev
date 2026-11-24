// U-02 R1: run e2e/terminal-react19.spec.ts against `next dev`, where React prints its development
// warnings (StrictMode double effects, ref/key warnings, removed defaultProps/propTypes).
// Usage (scratch git worktree only, never in the repo checkout: next dev writes .next/):
//   npx playwright test -c playwright.dev.config.ts
// Same port rules as playwright.config.ts (E2E_PORT or a free port; never 3000 or 3100).
import { defineConfig } from '@playwright/test';

import base from './playwright.config';

const port = process.env.E2E_PORT;
const webServer = Array.isArray(base.webServer) ? base.webServer[0] : base.webServer;

export default defineConfig({
  ...base,
  testMatch: /terminal-react19\.spec\.ts$/,
  webServer: {
    ...webServer,
    command: `npm run dev -- -p ${port} -H 127.0.0.1`,
    url: `http://127.0.0.1:${port}/terminal`,
  },
});
