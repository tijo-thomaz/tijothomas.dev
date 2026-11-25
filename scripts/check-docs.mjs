#!/usr/bin/env node
// CG14 docs gate: the unit's change touches README.md and CHANGELOG.md (both tracked, non-empty).
// Usage: node scripts/check-docs.mjs [--root <dir>] [--base <ref>]
//   --base  the unit's start commit (default: $EDD_BASE; required). Uncommitted changes count.
//           Per-unit, so a later unit cannot pass on README/CHANGELOG edits made by an earlier one.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { cliOptions } from './lib/gate-utils.mjs';

const opts = cliOptions();
const root = path.resolve(opts.get('--root', process.cwd()));
const git = (...a) => spawnSync('git', a, { cwd: root, encoding: 'utf8' });
const DOCS = ['README.md', 'CHANGELOG.md'];

const base = opts.get('--base') || process.env.EDD_BASE || '';
if (!base) {
  console.log('FAIL CG14 no base ref: pass --base <unit start commit> or set EDD_BASE');
  process.exit(1);
}
const changed = new Set(git('diff', '--name-only', base).stdout.split(/\r?\n/).filter(Boolean));
const problems = DOCS.flatMap((f) => {
  if (!fs.existsSync(path.join(root, f)) || !fs.readFileSync(path.join(root, f), 'utf8').trim()) return [`${f} is missing or empty`];
  if (git('ls-files', '--error-unmatch', f).status !== 0) return [`${f} is not tracked by git`];
  return changed.has(f) ? [] : [`${f} not updated since ${base.slice(0, 10)}`];
});
console.log(`${problems.length ? 'FAIL' : 'PASS'} CG14 README.md and CHANGELOG.md updated in this change`);
for (const p of problems) console.log(`  - ${p}`);
process.exit(problems.length ? 1 : 0);
