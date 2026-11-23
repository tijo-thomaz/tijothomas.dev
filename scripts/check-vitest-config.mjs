#!/usr/bin/env node
// Gate for PLAT-AC-05: vitest config (alias, include, no Storybook), `npm run test` = `vitest run`,
// an `@/` import loads in a collected test, and the suite passes N consecutive runs.
// Usage: node scripts/check-vitest-config.mjs [--root <dir>] [--runs N (default 3)] [--static]
//   --static  skip the vitest executions (config checks only)
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { stripComments } from './lib/repo-graph.mjs';
import { paths } from './paths.mjs';

const args = process.argv.slice(2);
const val = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const root = path.resolve(val('--root', process.cwd()));
const runs = Number(val('--runs', 3));
const PROBE = paths.aliasProbe;

let failed = false;
const report = (name, problems) => {
  if (problems.length) failed = true;
  console.log(`${problems.length ? 'FAIL' : 'PASS'} PLAT-AC-05 ${name}`);
  for (const p of problems) console.log(`  - ${p}`);
};

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const testScript = pkg.scripts?.test ?? '';
report('npm run test runs `vitest run`', /^vitest run(\s|$)/.test(testScript.trim()) ? [] : [`scripts.test is '${testScript}'`]);

const cfgFile = ['vitest.config.ts', 'vitest.config.mts', 'vitest.config.js', 'vitest.config.mjs'].find((f) => fs.existsSync(path.join(root, f)));
const cfg = cfgFile ? stripComments(fs.readFileSync(path.join(root, cfgFile), 'utf8')) : '';
report('vitest config exists', cfgFile ? [] : ['no vitest.config.* at the repo root']);

report('vitest config has no Storybook plugin or import', /storybook/i.test(cfg) ? [`${cfgFile} mentions storybook`] : []);

const hasAlias = /alias[\s\S]{0,200}?['"]@['"]\s*[:,]/.test(cfg) || /find\s*:\s*['"]@['"]/.test(cfg) || /tsconfigPaths\s*\(/.test(cfg);
report("vitest config resolves the '@/' alias", hasAlias ? [] : [`${cfgFile} defines no resolve.alias for '@' (tsconfig paths are not read by Vite)`]);

// Read the string literals of `test.include` only (not coverage.include or any other text).
// String-aware bracket matching, because globs contain `{` `}`.
const QUOTES = new Set(['"', "'", '`']);
// Index of the closing quote of the string literal that opens at src[i].
function skipString(src, i) {
  let j = i + 1;
  while (j < src.length && src[j] !== src[i]) j += src[j] === '\\' ? 2 : 1;
  return j;
}
// Bracket depth change for one character (0 for anything else).
const depthStep = (c) => ('{['.includes(c) ? 1 : '}]'.includes(c) ? -1 : 0);
// Index of the bracket that closes src[openIdx] (`{` or `[`), or -1.
function matchClose(src, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < src.length; i += 1) {
    if (QUOTES.has(src[i])) { i = skipString(src, i); continue; }
    depth += depthStep(src[i]);
    if (depth === 0) return i;
  }
  return -1;
}
// The body of a top-level `key: {…}` / `key: […]` at body[i], or undefined when there is none.
function valueAt(body, key, i) {
  if (i > 0 && !/[\s,{]/.test(body[i - 1])) return undefined;
  const m = new RegExp(`^\\b${key}\\s*:\\s*([[{])`).exec(body.slice(i));
  if (!m) return undefined;
  const start = i + m[0].length - 1;
  const end = matchClose(body, start);
  return end > 0 ? body.slice(start + 1, end) : null;
}
// Top-level `key: {…}` / `key: […]` inside an object body (skips nested objects/arrays).
function topLevelValue(body, key) {
  let depth = 0;
  for (let i = 0; i < body.length; i += 1) {
    if (QUOTES.has(body[i])) { i = skipString(body, i); continue; }
    const v = depth === 0 ? valueAt(body, key, i) : undefined;
    if (v !== undefined) return v;
    depth += depthStep(body[i]);
  }
  return null;
}
const configOpen = cfg.search(/defineConfig\s*\(\s*\{/);
const configBody = configOpen >= 0 ? (() => {
  const start = cfg.indexOf('{', configOpen);
  return cfg.slice(start + 1, matchClose(cfg, start));
})() : '';
const testBody = topLevelValue(configBody, 'test');
const includeBody = testBody ? topLevelValue(testBody, 'include') : null;
const includeGlobs = includeBody ? [...includeBody.matchAll(/(['"`])((?:\\.|(?!\1).)*)\1/g)].map((m) => m[2]) : [];

const includeProblems = [];
if (!testBody) includeProblems.push(`${cfgFile} has no test: { … } block in defineConfig({ … })`);
else if (!includeBody) includeProblems.push('test.include is missing or not an array literal');
else for (const g of paths.testGlobs) if (!includeGlobs.includes(g)) includeProblems.push(`test.include has no '${g}' (scripts/paths.mjs testGlobs)`);
report(`test.include covers ${paths.testGlobs.join(' and ')}`, includeProblems);

if (!args.includes('--static')) {
  const sh = (cmd) => spawnSync(cmd, { cwd: root, shell: true, encoding: 'utf8' });
  const probe = sh(`npx vitest run ${PROBE}`);
  // eslint-disable-next-line no-control-regex
  const plain = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');
  const tail = (r) => plain(`${r.stdout}${r.stderr}`).trim().split(/\r?\n/)
    .filter((l) => /^\s*(FAIL|Test Files|Tests\s)|No test files|Failed to (resolve|load)/.test(l)).slice(0, 8).map((l) => l.trim().slice(0, 160));
  report(`a test importing through '@/' loads (${PROBE})`, probe.status === 0 ? [] : [`exit ${probe.status}`, ...tail(probe)]);
  if (!failed) {
    const problems = [];
    for (let i = 1; i <= runs; i += 1) {
      const r = sh('npm run test');
      problems.push(...(r.status === 0 ? [] : [`run ${i}/${runs}: exit ${r.status}`, ...tail(r)]));
    }
    report(`npm run test passes ${runs} consecutive runs`, problems);
  } else {
    report(`npm run test passes ${runs} consecutive runs`, ['skipped: earlier PLAT-AC-05 checks failed']);
  }
}
process.exit(failed ? 1 : 0);
