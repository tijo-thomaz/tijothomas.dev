#!/usr/bin/env node
// CG5 coverage gate: runs vitest with V8 coverage, then measures coverage of the lines this change
// added or modified in source files (diff coverage): lines >= 80 %, branches >= 70 %.
// Usage: node scripts/check-coverage.mjs [--root <dir>] [--base <ref>] [--out <dir>] [--no-run]
//   --base    diff base (default: merge-base of HEAD and main); uncommitted changes count
//   --out     where vitest writes coverage (default: coverage/); coverage-diff.json goes there too
//   --no-run  reuse an existing <out>/coverage-final.json
// Source files = paths.srcRoots, minus tests. A change with 0 instrumented changed lines passes and
// says so (the whole-suite summary is still recorded).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { cliOptions, writeJson } from './lib/gate-utils.mjs';
import { inRoots, isTest, toPosix } from './lib/repo-graph.mjs';
import { paths } from './paths.mjs';

const opts = cliOptions();
const root = path.resolve(opts.get('--root', process.cwd()));
const outDir = path.resolve(root, opts.get('--out', 'coverage'));
const MIN = { lines: 80, branches: 70 };
const git = (...a) => spawnSync('git', a, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

if (!opts.has('--no-run')) {
  const vitest = path.join(root, 'node_modules', 'vitest', 'vitest.mjs');
  const r = spawnSync(process.execPath, [vitest, 'run', '--coverage', '--coverage.reporter=json', '--coverage.reporter=json-summary',
    '--coverage.reporter=text-summary', `--coverage.reportsDirectory=${outDir}`], { cwd: root, stdio: 'inherit' });
  if (r.status !== 0) {
    console.log(`FAIL CG5 vitest run --coverage exited ${r.status}`);
    process.exit(1);
  }
}

// Added/modified line numbers per repo-relative file, from `git diff -U0 <base>`.
function changedLines(base) {
  const out = new Map();
  let file = null;
  for (const line of git('diff', '-U0', '--no-color', base, '--', '.').stdout.split(/\r?\n/)) {
    const f = /^\+\+\+ b\/(.+)$/.exec(line);
    if (f) { file = f[1]; continue; }
    const h = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(line);
    if (!h || !file) continue;
    const set = out.get(file) ?? new Set();
    for (let i = 0; i < Number(h[2] ?? 1); i += 1) set.add(Number(h[1]) + i);
    out.set(file, set);
  }
  return out;
}

// [covered, total] lines: a changed line with a statement is covered if any statement on it ran.
function lineStats(fileCov, lines) {
  const lineHit = new Map();
  for (const [k, loc] of Object.entries(fileCov.statementMap)) {
    const n = loc.start.line;
    if (lines.has(n)) lineHit.set(n, lineHit.get(n) === true || fileCov.s[k] > 0);
  }
  const hits = [...lineHit.values()];
  return [hits.filter(Boolean).length, hits.length];
}

// [covered, total] branch arms of branches that start on a changed line.
function branchStats(fileCov, lines) {
  const arms = Object.entries(fileCov.branchMap)
    .filter(([, br]) => lines.has(br.loc?.start?.line ?? br.locations?.[0]?.start?.line))
    .flatMap(([k]) => fileCov.b[k]);
  return [arms.filter((n) => n > 0).length, arms.length];
}

const measure = (fileCov, lines) => ({ lines: lineStats(fileCov, lines), branches: branchStats(fileCov, lines) });

const base = opts.get('--base') ?? git('merge-base', 'HEAD', 'main').stdout.trim();
const finalFile = path.join(outDir, 'coverage-final.json');
if (!base || !fs.existsSync(finalFile)) {
  console.log(`FAIL CG5 ${!base ? 'no diff base (pass --base <ref>)' : `${finalFile} not found`}`);
  process.exit(1);
}
const cov = JSON.parse(fs.readFileSync(finalFile, 'utf8'));
const changed = changedLines(base);
const total = { lines: [0, 0], branches: [0, 0] };
const perFile = {};
for (const [abs, fileCov] of Object.entries(cov)) {
  const rel = toPosix(path.relative(root, abs));
  const lines = changed.get(rel);
  if (!lines || isTest(rel) || !inRoots(rel, paths.srcRoots)) continue;
  const m = measure(fileCov, lines);
  perFile[rel] = m;
  for (const k of ['lines', 'branches']) { total[k][0] += m[k][0]; total[k][1] += m[k][1]; }
}
const pct = ([c, t]) => (t === 0 ? 100 : (100 * c) / t);
const checks = ['lines', 'branches'].map((k) => [k, pct(total[k]), total[k]]);
const ok = checks.every(([k, p]) => p >= MIN[k]);
for (const [k, p, [c, t]] of checks) {
  console.log(`${p >= MIN[k] ? 'PASS' : 'FAIL'} CG5 diff ${k} coverage ${t ? `${p.toFixed(1)}% (${c}/${t})` : 'n/a: 0 instrumented changed lines'} >= ${MIN[k]}%`);
}
const summaryFile = path.join(outDir, 'coverage-summary.json');
const suite = fs.existsSync(summaryFile) ? JSON.parse(fs.readFileSync(summaryFile, 'utf8')).total : null;
if (suite) console.log(`suite: lines ${suite.lines.pct}%, branches ${suite.branches.pct}% (informational)`);
writeJson(path.join(outDir, 'coverage-diff.json'), { base, thresholds: MIN, total, perFile, suite });
process.exit(ok ? 0 : 1);
