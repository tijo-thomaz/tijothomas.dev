#!/usr/bin/env node
// Gate for PLAT-AC-05: vitest config (alias, include, no Storybook), `npm run test` = `vitest run`,
// an `@/` import loads in a collected test, and the suite passes N consecutive runs.
// Usage: node scripts/check-vitest-config.mjs [--root <dir>] [--runs N (default 3)] [--static]
//   --static  skip the vitest executions (config checks only)
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { stripComments } from './lib/repo-graph.mjs';

const args = process.argv.slice(2);
const val = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const root = path.resolve(val('--root', process.cwd()));
const runs = Number(val('--runs', 3));
const PROBE = 'lib/vitest-alias.test.ts';
const DIRS = ['app', 'components', 'terminal', 'content', 'lib'];

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

const braceGlob = `{${DIRS.join(',')}}/**/*.test.{ts,tsx}`;
const missingDirs = cfg.includes(braceGlob) ? [] : DIRS.filter((d) => !cfg.includes(`${d}/**/*.test.{ts,tsx}`));
report(`test.include covers ${braceGlob}`, missingDirs.map((d) => `include has no glob for ${d}/`));

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
      if (r.status !== 0) problems.push(`run ${i}/${runs}: exit ${r.status}`, ...tail(r));
    }
    report(`npm run test passes ${runs} consecutive runs`, problems);
  } else {
    report(`npm run test passes ${runs} consecutive runs`, ['skipped: earlier PLAT-AC-05 checks failed']);
  }
}
process.exit(failed ? 1 : 0);
