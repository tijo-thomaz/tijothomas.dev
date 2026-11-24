// U-09: the raw-HTML sink is confined to the JSON-LD helper (PLAT-AC-23), and Lighthouse is enforced
// (SEO-AC-10).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readJsonc, readText, repoFile, walkRepo } from './lib/test-utils.mjs';
import { paths } from './paths.mjs';

const JSON_LD = `${paths.layers.lib}/json-ld.ts`;
const inTerminal = (f) => f.startsWith(`${paths.layers.terminal}/`);
const isTest = (f) => /\.(test|spec)\.[cm]?[jt]sx?$/.test(f);

test('PLAT-AC-23 Oxlint has react/no-danger as an error, switched off only for the JSON-LD helper', () => {
  const cfg = readJsonc('.oxlintrc.json');
  assert.equal(cfg.rules['react/no-danger'], 'error');
  const off = (cfg.overrides ?? []).filter((o) => o.rules?.['react/no-danger'] === 'off').flatMap((o) => o.files);
  assert.deepEqual(off, [JSON_LD]);
});

test('PLAT-AC-23 dangerouslySetInnerHTML appears outside the terminal only in the JSON-LD helper', () => {
  const files = walkRepo().filter((f) => paths.siteRoots.some((r) => f.startsWith(`${r}/`)) && !inTerminal(f) && !isTest(f)
    && /\.[cm]?[jt]sx?$/.test(f) && fs.statSync(repoFile(f)).isFile());
  assert.deepEqual(files.filter((f) => readText(f).includes('dangerouslySetInnerHTML')), [JSON_LD]);
});

test('SEO-AC-10 the Lighthouse gate is enforced: median of 3, mobile, >= 95 x4 with CLS, LCP and TBT budgets', () => {
  const block = readText('gates.yml').split(/\n\s*-\s+id:\s*/).find((b) => b.startsWith('lighthouse'));
  assert.ok(block, 'no lighthouse gate');
  assert.match(block, /enforce:\s*true/);
  assert.match(block, /--runs 3/);
  const script = readText('scripts/lighthouse.mjs');
  for (const budget of [/95/, /0\.05/, /2500/, /150/]) assert.match(script, budget);
});
