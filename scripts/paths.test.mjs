// U-01 scope 1 / DoD / risk R18: scripts/paths.mjs is the only place gate scripts get folder names
// from, so the U-03 move to src/ is one edit and no gate passes vacuously on old folders.
// Supports PLAT-AC-11/12/13/05 (U-00 gates, refactored here) and PLAT-AC-14 (terminalGlobs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { loadPaths, readText, repoFile, repoRoot, stripComments } from './lib/test-utils.mjs';

const KEYS = ['entries', 'srcRoots', 'terminalGlobs', 'testGlobs', 'siteRoots'];
const staticPrefix = (glob) => glob.split('/').filter((s) => s && s !== '.').reduce(
  (acc, s) => (acc.done || /[*?{[]/.test(s) ? { ...acc, done: true } : { parts: [...acc.parts, s], done: false }),
  { parts: [], done: false },
).parts.join('/');

test('U-01 scripts/paths.mjs exports paths with non-empty string arrays entries, srcRoots, terminalGlobs, testGlobs, siteRoots', async () => {
  const paths = await loadPaths();
  const problems = KEYS.flatMap((k) => {
    const v = paths[k];
    if (!Array.isArray(v)) return [`${k}: not an array`];
    if (v.length === 0) return [`${k}: empty`];
    return v.some((x) => typeof x !== 'string' || !x) ? [`${k}: has a non-string or empty item`] : [];
  });
  assert.deepEqual(problems, []);
});

test('U-01 every folder and fixed path in paths.mjs exists on disk (no vacuous gates)', async () => {
  const paths = await loadPaths();
  const all = [...paths.entries, ...paths.srcRoots, ...paths.siteRoots, ...paths.terminalGlobs, ...paths.testGlobs];
  const missing = [...new Set(all.map(staticPrefix).filter(Boolean))].filter((p) => !fs.existsSync(path.join(repoRoot, p)));
  assert.deepEqual(missing, []);
});

test('U-01 U-00 gate scripts read their folders from scripts/paths.mjs', () => {
  const files = ['scripts/lib/repo-graph.mjs', 'scripts/check-unreachable.mjs', 'scripts/check-vitest-config.mjs'];
  const notImporting = files.filter((f) => !/from\s+['"](\.\.?\/)+paths\.mjs['"]/.test(stripComments(readText(f))));
  assert.deepEqual(notImporting, []);
});

test('U-01 DoD no script outside scripts/paths.mjs hard-codes a source folder name', async () => {
  const paths = await loadPaths();
  // Folder names = every non-glob, extension-less path segment that paths.mjs knows about.
  const names = new Set([...paths.entries, ...paths.srcRoots, ...paths.siteRoots, ...paths.terminalGlobs]
    .flatMap((p) => staticPrefix(p).split('/')).filter((s) => s && !s.includes('.')));
  assert.ok(names.size > 0, 'paths.mjs yields no folder names');
  const re = new RegExp(`(['"\`])(${[...names].join('|')})(/[^'"\`]*)?\\1`, 'g');
  const scripts = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(repoFile(dir), { withFileTypes: true })) {
      const rel = `${dir}/${e.name}`;
      if (e.isDirectory()) walk(rel);
      else if (/\.[cm]?js$/.test(e.name) && rel !== 'scripts/paths.mjs') scripts.push(rel);
    }
  };
  walk('scripts');
  const hits = scripts.flatMap((f) => [...stripComments(readText(f)).matchAll(re)].map((m) => `${f}: ${m[0]}`));
  assert.deepEqual(hits, []);
});
