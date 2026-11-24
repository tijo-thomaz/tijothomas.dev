// PLAT-AC-10 (Verify: gate): behaviour of scripts/check-renames.mjs on temp git fixtures, plus the
// real repo once the U-03 move commit exists.
//
// Contract (U-03 scope 5):
//   node scripts/check-renames.mjs [--root <dir>] [--commit <sha>] [--min <pct, default 90>]
//   - The move commit is --commit, else `moveCommit` in <root>/scripts/rename-exceptions.json.
//   - rename-exceptions.json: { "moveCommit": "<sha>", "exceptions": [{ "path": "<new path>", "reason": "…" }] }
//   - Check 1 (move commit): `git diff -M --name-status <c>^ <c>` has only R entries, each with
//     similarity >= min; any A/D/M/C/T entry or a low score is a FAIL naming the path; 0 renames FAIL.
//   - Check 2 (HEAD): every old -> new rename of the move commit still diffs as a rename >= min from
//     <c>^ to HEAD, unless `new` is listed in exceptions (SQ-01/SQ-05 data-only commits).
//   - Check 3: every exception names a file renamed in the move commit and has a non-empty reason.
//   - Each check prints `PASS|FAIL PLAT-AC-10 <name>`, then a summary line `renames: <n>`;
//     exit 0 only if all pass. For the U-03 commit A evidence, also save `git diff -M --stat`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  makeFixture, readText, removeFixture, repoFile, runScript, writeFiles,
} from './lib/test-utils.mjs';

const GIT_ID = ['-c', 'user.email=fixture@example.test', '-c', 'user.name=fixture', '-c', 'core.autocrlf=false'];
function git(cwd, ...args) {
  const r = spawnSync('git', [...GIT_ID, ...args], { cwd, encoding: 'utf8' });
  assert.equal(r.status, 0, `git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}
const commit = (cwd, msg) => { git(cwd, 'add', '-A'); git(cwd, 'commit', '-q', '-m', msg); return git(cwd, 'rev-parse', 'HEAD'); };

// 30 distinct lines, so one changed line keeps similarity well above 90 % and a rewrite drops it.
const body = (tag) => Array.from({ length: 30 }, (_, i) => `export const ${tag}${i} = '${tag}-${i}-${'x'.repeat(20)}';`).join('\n') + '\n';
const rewrite = (tag) => Array.from({ length: 30 }, (_, i) => `// rewritten ${tag} ${i} ${'y'.repeat(30)}`).join('\n') + '\n';

// Repo with old/a.ts, old/b.ts, old/c/d.ts at commit 1; `git mv` into new/ at commit 2 (the move).
function movedRepo({ editInMove, addInMove } = {}) {
  const dir = makeFixture({ 'old/a.ts': body('a'), 'old/b.ts': body('b'), 'old/c/d.ts': body('d') });
  git(dir, 'init', '-q');
  commit(dir, 'base');
  fs.mkdirSync(path.join(dir, 'new/c'), { recursive: true });
  git(dir, 'mv', 'old/a.ts', 'new/a.ts');
  git(dir, 'mv', 'old/b.ts', 'new/b.ts');
  git(dir, 'mv', 'old/c/d.ts', 'new/c/d.ts');
  if (editInMove) writeFiles(dir, { [editInMove]: rewrite('m') });
  if (addInMove) writeFiles(dir, { [addInMove]: body('n') });
  const move = commit(dir, 'move');
  return { dir, move };
}

const exceptions = (dir, data) => writeFiles(dir, { 'scripts/rename-exceptions.json': JSON.stringify(data, null, 2) });
const check = (dir, args = []) => runScript('check-renames.mjs', ['--root', dir, ...args]);

test('PLAT-AC-10 check-renames passes on a git mv-only move commit and reports every rename', () => {
  const { dir, move } = movedRepo();
  try {
    const r = check(dir, ['--commit', move]);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS PLAT-AC-10 /);
    assert.doesNotMatch(r.out, /FAIL/);
    assert.match(r.out, /^renames: 3\b/m, 'summary line `renames: <n>` missing or wrong');
  } finally { removeFixture(dir); }
});

test('PLAT-AC-10 check-renames fails and names the file when a moved file drops below 90 % similarity in the move commit', () => {
  const { dir, move } = movedRepo({ editInMove: 'new/b.ts' });
  try {
    const r = check(dir, ['--commit', move]);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL PLAT-AC-10 /);
    assert.ok(r.out.includes('b.ts'), r.out);
  } finally { removeFixture(dir); }
});

test('PLAT-AC-10 check-renames fails when the move commit also adds a file (move commit must be renames only)', () => {
  const { dir, move } = movedRepo({ addInMove: 'new/extra.ts' });
  try {
    const r = check(dir, ['--commit', move]);
    assert.equal(r.status, 1, r.out);
    assert.ok(r.out.includes('new/extra.ts'), r.out);
  } finally { removeFixture(dir); }
});

test('PLAT-AC-10 check-renames fails on a commit with 0 renames (no vacuous pass)', () => {
  const dir = makeFixture({ 'a.ts': body('a') });
  try {
    git(dir, 'init', '-q');
    commit(dir, 'base');
    writeFiles(dir, { 'a.ts': `${body('a')}export const z = 1;\n` });
    const c = commit(dir, 'edit');
    const r = check(dir, ['--commit', c]);
    assert.notEqual(r.status, 0, r.out);
    assert.match(r.out, /FAIL PLAT-AC-10 /);
  } finally { removeFixture(dir); }
});

test('PLAT-AC-10 check-renames fails when a later commit rewrites a moved file that is not an exception', () => {
  const { dir, move } = movedRepo();
  try {
    writeFiles(dir, { 'new/a.ts': rewrite('later') });
    commit(dir, 'later rewrite');
    const r = check(dir, ['--commit', move]);
    assert.equal(r.status, 1, r.out);
    assert.ok(r.out.includes('new/a.ts'), r.out);
  } finally { removeFixture(dir); }
});

test('PLAT-AC-10 check-renames accepts a one-line import-path fix after the move (commit B)', () => {
  const { dir, move } = movedRepo();
  try {
    writeFiles(dir, { 'new/a.ts': body('a').replace("export const a0 = ", "export const a0 = /* path fix */ ") });
    commit(dir, 'fix import paths');
    const r = check(dir, ['--commit', move]);
    assert.equal(r.status, 0, r.out);
  } finally { removeFixture(dir); }
});

test('PLAT-AC-10 check-renames checks an excepted file at the move commit only, and reads moveCommit from rename-exceptions.json', () => {
  const { dir, move } = movedRepo();
  try {
    writeFiles(dir, { 'new/a.ts': rewrite('pii-strip') });
    exceptions(dir, { moveCommit: move, exceptions: [{ path: 'new/a.ts', reason: 'SQ-05 data-only PII strip' }] });
    commit(dir, 'data-only edit');
    const r = check(dir); // no --commit: moveCommit comes from the file
    assert.equal(r.status, 0, r.out);
  } finally { removeFixture(dir); }
});

test('PLAT-AC-10 check-renames fails when an exception has no reason or names a file the move commit did not rename', () => {
  const { dir, move } = movedRepo();
  try {
    exceptions(dir, { moveCommit: move, exceptions: [{ path: 'new/a.ts', reason: '' }, { path: 'new/never-moved.ts', reason: 'x' }] });
    const r = check(dir);
    assert.equal(r.status, 1, r.out);
    assert.ok(r.out.includes('new/a.ts') && r.out.includes('new/never-moved.ts'), r.out);
  } finally { removeFixture(dir); }
});

test('PLAT-AC-10 check-renames fails when the move commit is unknown', () => {
  const { dir } = movedRepo();
  try {
    const r = check(dir, ['--commit', 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeef']);
    assert.notEqual(r.status, 0, r.out);
    assert.match(r.out, /FAIL PLAT-AC-10 /);
  } finally { removeFixture(dir); }
});

test('PLAT-AC-10 scripts/rename-exceptions.json records the U-03 move commit, and check-renames exits 0 on the real repo', () => {
  const file = repoFile('scripts/rename-exceptions.json');
  assert.ok(fs.existsSync(file), 'scripts/rename-exceptions.json does not exist yet');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.match(data.moveCommit ?? '', /^[0-9a-f]{7,40}$/, 'moveCommit is not a commit hash');
  assert.ok(Array.isArray(data.exceptions), 'exceptions must be an array');
  const r = runScript('check-renames.mjs');
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /PASS PLAT-AC-10 /);
});

test('PLAT-AC-10 gates.yml has an enforced gate that runs scripts/check-renames.mjs', () => {
  const block = readText('gates.yml').split(/\n\s*-\s+id:\s*/).find((b) => /node scripts\/check-renames\.mjs/.test(b));
  assert.ok(block, 'no gate runs scripts/check-renames.mjs');
  assert.match(block, /enforce:\s*true/);
});

// U-03 review minor carried to U-04: a moved file deleted later must be declared, so a deletion
// cannot hide a rewrite (delete + re-add under another name) or silently drop terminal code.
test('PLAT-AC-10 U-04 check-renames fails and names a moved file deleted later without an exception', () => {
  const { dir, move } = movedRepo();
  try {
    git(dir, 'rm', '-q', 'new/b.ts');
    commit(dir, 'delete moved file');
    const r = check(dir, ['--commit', move]);
    assert.equal(r.status, 1, r.out);
    assert.ok(r.out.includes('new/b.ts'), r.out);
  } finally { removeFixture(dir); }
});

test('PLAT-AC-10 U-04 check-renames accepts a later deletion of a moved file listed in the exceptions', () => {
  const { dir, move } = movedRepo();
  try {
    git(dir, 'rm', '-q', 'new/b.ts');
    exceptions(dir, { moveCommit: move, exceptions: [{ path: 'new/b.ts', reason: 'SQ-01 chat route removed' }] });
    commit(dir, 'delete moved file');
    const r = check(dir);
    assert.equal(r.status, 0, r.out);
  } finally { removeFixture(dir); }
});
