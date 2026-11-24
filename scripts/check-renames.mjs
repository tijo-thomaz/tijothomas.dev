#!/usr/bin/env node
// Gate for PLAT-AC-10: the U-03 move commit is renames only (each >= --min % similar), and every
// moved file is still a rename >= --min % from before the move to HEAD, so the move cannot hide a
// behaviour change. Files later edited by a recorded data-only commit (SQ-01/SQ-05) are listed in
// scripts/rename-exceptions.json and are checked at the move commit only.
// Usage: node scripts/check-renames.mjs [--root <dir>] [--commit <sha>] [--min <pct, default 90>]
//   The commit defaults to `moveCommit` in <root>/scripts/rename-exceptions.json:
//   { "moveCommit": "<sha>", "exceptions": [{ "path": "<new path>", "reason": "…" }] }
// Prints `PASS|FAIL PLAT-AC-10 <check>` lines and a `renames: <n>` summary; exit 0 only if all pass.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { cliOptions } from './lib/gate-utils.mjs';

const opts = cliOptions();
const root = path.resolve(opts.get('--root', process.cwd()));
const min = Number(opts.get('--min', 90));
const EXCEPTIONS = 'scripts/rename-exceptions.json';

function git(...args) {
  const r = spawnSync('git', ['-c', 'core.quotepath=false', ...args], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return { ok: r.status === 0, out: r.stdout ?? '', err: (r.stderr ?? '').trim() };
}

let failed = false;
function report(name, problems) {
  if (problems.length) failed = true;
  console.log(`${problems.length ? 'FAIL' : 'PASS'} PLAT-AC-10 ${name}${problems.length ? ` (${problems.length})` : ''}`);
  for (const p of problems) console.log(`  - ${p}`);
}
function finish(renames) {
  console.log(`renames: ${renames}`);
  process.exit(failed ? 1 : 0);
}

function readExceptions() {
  const file = path.join(root, EXCEPTIONS);
  if (!fs.existsSync(file)) return { moveCommit: undefined, exceptions: [] };
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  return { moveCommit: data.moveCommit, exceptions: Array.isArray(data.exceptions) ? data.exceptions : [] };
}

// `git diff -M --name-status -z a b` -> [{ status, score, from, to }]
function nameStatus(a, b) {
  const r = git('diff', '-M', '-l0', '--name-status', '-z', a, b);
  if (!r.ok) return null;
  const parts = r.out.split('\0');
  const out = [];
  for (let i = 0; i < parts.length;) {
    const code = parts[i];
    if (!code) { i += 1; continue; }
    const kind = code[0];
    const twoPaths = kind === 'R' || kind === 'C';
    out.push({ status: kind, score: Number(code.slice(1)) || 0, from: parts[i + 1], to: twoPaths ? parts[i + 2] : parts[i + 1] });
    i += twoPaths ? 3 : 2;
  }
  return out;
}

const { moveCommit, exceptions } = readExceptions();
const commit = opts.get('--commit', moveCommit);
if (!commit) {
  report('move commit is known', [`no --commit and no moveCommit in ${EXCEPTIONS}`]);
  finish(0);
}
const parent = git('rev-parse', '--verify', '--quiet', `${commit}^{commit}`);
if (!parent.ok || !git('rev-parse', '--verify', '--quiet', `${commit}^`).ok) {
  report('move commit is known', [`${commit}: not a commit with a parent in ${root}`]);
  finish(0);
}

// Check 1: the move commit holds only renames, each >= min.
const move = nameStatus(`${commit}^`, commit) ?? [];
const renames = move.filter((e) => e.status === 'R');
report(`move commit ${commit.slice(0, 12)} is renames only, each >= ${min} % similar`, [
  ...(renames.length === 0 ? ['0 renames in the move commit'] : []),
  ...move.filter((e) => e.status !== 'R').map((e) => `${e.status} ${e.to}`),
  ...renames.filter((e) => e.score < min).map((e) => `${e.from} -> ${e.to} (${e.score} %)`),
]);

// Check 3: exceptions name a moved file and give a reason.
const movedTo = new Set(renames.map((e) => e.to));
report(`${EXCEPTIONS} entries name a moved file and give a reason`, exceptions.flatMap((x) => [
  ...(movedTo.has(x.path) ? [] : [`${x.path}: not renamed in the move commit`]),
  ...(typeof x.reason === 'string' && x.reason.trim() ? [] : [`${x.path}: no reason`]),
]));

// Check 2: every moved file is still a rename >= min from before the move to HEAD.
const excepted = new Set(exceptions.map((x) => x.path));
const now = nameStatus(`${commit}^`, 'HEAD') ?? [];
const byFrom = new Map(now.map((e) => [e.from, e]));
const atHead = (p) => git('cat-file', '-e', `HEAD:${p}`).ok;
const describe = (cur) => (cur ? `${cur.status}${cur.score ? ` ${cur.score} %` : ''} -> ${cur.to}` : 'no diff entry');
const drift = renames.filter((e) => !excepted.has(e.to)).flatMap((e) => {
  const cur = byFrom.get(e.from);
  if (cur?.status === 'R' && cur.to === e.to && cur.score >= min) return [];
  // Deleted later (U-04): allowed only when declared in the exceptions, so a removal is a recorded decision.
  if (cur?.status === 'D' && !atHead(e.to)) return [`${e.to}: deleted after the move; declare it in ${EXCEPTIONS}`];
  return [`${e.to}: ${describe(cur)} from ${e.from} at HEAD`];
});
report(`moved files are still renames >= ${min} % at HEAD (${excepted.size} exceptions checked at the move commit only)`, drift);

finish(renames.length);
