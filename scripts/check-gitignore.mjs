#!/usr/bin/env node
// Gate for PLAT-AC-18: specs/home.md is not git-ignored and is tracked.
// Usage: node scripts/check-gitignore.mjs [--root <dir>]   -> `PASS|FAIL PLAT-AC-18 …`, exit 1 on FAIL.
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const root = path.resolve(args.includes('--root') ? args[args.indexOf('--root') + 1] : process.cwd());
const FILE = 'specs/home.md';
const git = (...a) => spawnSync('git', a, { cwd: root, encoding: 'utf8' });

const problems = [];
const ignored = git('check-ignore', '-v', FILE);
if (ignored.status === 0 && ignored.stdout.trim()) problems.push(`${FILE} is git-ignored by ${ignored.stdout.trim()}`);
else if (ignored.status > 1) problems.push(`git check-ignore failed: ${ignored.stderr.trim() || `exit ${ignored.status}`}`);
const tracked = git('ls-files', '--error-unmatch', FILE);
if (tracked.status !== 0) problems.push(`${FILE} is not tracked by git`);

console.log(`${problems.length ? 'FAIL' : 'PASS'} PLAT-AC-18 ${FILE} is tracked and not git-ignored`);
for (const p of problems) console.log(`  - ${p}`);
process.exit(problems.length ? 1 : 0);
