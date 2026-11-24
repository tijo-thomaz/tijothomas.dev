// U-07 (U-03 review finding, carried by the U-06 review #7): the (site) stylesheet uses its own
// Tailwind config, whose `content` covers only the site layers, so `/` ships no terminal utilities.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { readText, repoFile } from './lib/test-utils.mjs';
import { paths } from './paths.mjs';

const require = createRequire(import.meta.url);
const SITE_CSS = `${paths.layers.site}/globals.css`;

test('U-07 the (site) stylesheet points @config at a site-only Tailwind config', () => {
  const css = readText(SITE_CSS);
  const m = css.match(/@config\s+["']([^"']+)["']/);
  assert.ok(m, `${SITE_CSS} has no @config`);
  const configPath = path.resolve(path.dirname(repoFile(SITE_CSS)), m[1]);
  assert.ok(fs.existsSync(configPath), `${m[1]} does not exist`);
  const content = require(configPath).content;
  assert.ok(Array.isArray(content) && content.length > 0, 'site config has no content globs');
  assert.deepEqual(content.filter((g) => g.includes(paths.layers.terminal.split('/').pop())), [], 'site config scans the terminal');
  for (const layer of [paths.layers.components, paths.layers.content, paths.layers.lib]) {
    assert.ok(content.some((g) => g.includes(layer.split('/').pop())), `site config does not scan ${layer}`);
  }
});
