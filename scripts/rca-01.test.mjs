// RCA-01 regression tests (edd-docs/rca/RCA-01-u04-escaped-defects.md).
// 1. Every github.com/<account> in shipped source is the owner's account from the resolved facts (F-68).
//    The terminal cannot import src/content (PLAT-AC-09), so its copies are checked here instead.
// 2. CHANGELOG.md keeps its Keep-a-Changelog shape: one "# Changelog" title, one "## [Unreleased]",
//    and no section heading repeated inside a release (a scripted replace once pasted the header in).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readText, repoFile, walkRepo } from './lib/test-utils.mjs';
import { paths } from './paths.mjs';

const inSite = (f) => paths.siteRoots.some((r) => f.startsWith(`${r}/`));

test('TERM-AC-11 RCA-01 every github.com account in shipped source is the F-68 account', () => {
  const f68 = readText('edd-docs/questions/1.1-facts-resolved.md').match(/github\.com\/([A-Za-z0-9_-]+)/);
  assert.ok(f68, 'F-68 GitHub URL not found in 1.1-facts-resolved.md');
  const owner = f68[1];
  const files = walkRepo().filter((f) => inSite(f) && fs.statSync(repoFile(f)).isFile() && /\.[cm]?[jt]sx?$/.test(f));
  const wrong = files.flatMap((f) =>
    [...readText(f).matchAll(/github\.com\/([A-Za-z0-9_-]+)/g)]
      .filter((m) => m[1] !== owner)
      .map((m) => `${f}: github.com/${m[1]}`),
  );
  assert.deepEqual(wrong, []);
});

test('PLAT-AC-19 RCA-01 CHANGELOG.md has one title, one Unreleased section and no repeated heading per release', () => {
  const lines = readText('CHANGELOG.md').split(/\r?\n/);
  assert.equal(lines.filter((l) => l.startsWith('# ')).length, 1, 'more than one "# " title');
  assert.equal(lines[0], '# Changelog');
  assert.equal(lines.filter((l) => l === '## [Unreleased]').length, 1, '"## [Unreleased]" is not unique');
  const releases = lines.join('\n').split(/\n(?=## )/);
  for (const r of releases) {
    const heads = r.split('\n').filter((l) => l.startsWith('### '));
    assert.deepEqual(heads, [...new Set(heads)], `repeated section heading in: ${r.split('\n')[0]}`);
  }
});
