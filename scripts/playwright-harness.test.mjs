// U-01 scope 4 (walking skeleton): Playwright runs e2e/ against `next build && next start`.
// No AC of its own; U-03 turns the smoke test into the /terminal AC test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readPkg, readText, repoFile, stripComments } from './lib/test-utils.mjs';

test('U-01 playwright.config.ts uses testDir e2e and a webServer running next build && next start', () => {
  assert.ok(fs.existsSync(repoFile('playwright.config.ts')), 'playwright.config.ts does not exist');
  const cfg = stripComments(readText('playwright.config.ts'));
  assert.match(cfg, /testDir\s*:\s*['"`]\.?\/?e2e\/?['"`]/);
  assert.match(cfg, /webServer\s*:/);
  assert.match(cfg, /(next build|npm run build)\s*&&\s*(next start|npm (run )?start)/);
  assert.match(cfg, /baseURL\s*:/);
});

test('U-01 @playwright/test is an exact-pinned devDependency and test:e2e runs playwright test', () => {
  const pkg = readPkg();
  assert.match(pkg.devDependencies?.['@playwright/test'] ?? '', /^\d+\.\d+\.\d+$/, '@playwright/test missing or not exact-pinned');
  assert.match(pkg.scripts?.['test:e2e'] ?? '', /^playwright test(\s|$)/);
});

test('U-01 e2e/smoke.spec.ts exists', () => {
  assert.ok(fs.existsSync(repoFile('e2e/smoke.spec.ts')));
});
