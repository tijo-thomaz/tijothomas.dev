// TERM-AC-10 (Verify: gate), U-04: behaviour of scripts/check-groq.mjs.
//
// Contract:
//   node scripts/check-groq.mjs [--root <dir>] [--no-build]
//   - Searches every file under <root>/src and, unless --no-build, <root>/.next/server and
//     <root>/.next/static, for `api.groq.com` and for a Groq SDK import (`groq-sdk`, `@ai-sdk/groq`).
//   - Each hit prints `<file> <what>`; last line `PASS TERM-AC-10 …` (exit 0) or `FAIL TERM-AC-10 …` (exit 1).
//   - Exit 2 if src/ is missing, or .next/ is missing without --no-build (no vacuous pass).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeFixture, removeFixture, runScript } from './lib/test-utils.mjs';
import { paths } from './paths.mjs';

// Folder names come from scripts/paths.mjs (U-01 DoD): every source root must exist in a fixture.
const roots = Object.fromEntries(paths.siteRoots.map((r) => [`${r}/.keep`, '']));
const T = paths.layers.terminal;

const check = (dir, args = []) => runScript('check-groq.mjs', ['--root', dir, ...args]);
const base = {
  ...roots,
  '.next/server/app/index.html': '<html></html>',
  '.next/static/chunks/main.js': 'var a=1;',
};

test('TERM-AC-10 check-groq passes when neither src nor the build mention Groq', () => {
  const dir = makeFixture(base);
  try {
    const r = check(dir);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS TERM-AC-10/);
  } finally { removeFixture(dir); }
});

test('TERM-AC-10 check-groq fails on api.groq.com in src and names the file', () => {
  const dir = makeFixture({ ...base, [`${T}/api/chat/route.ts`]: "fetch('https://api.groq.com/openai/v1/chat/completions')" });
  try {
    const r = check(dir);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /src\/terminal\/api\/chat\/route\.ts api\.groq\.com/);
  } finally { removeFixture(dir); }
});

test('TERM-AC-10 check-groq fails on a Groq SDK import in a server build chunk', () => {
  const dir = makeFixture({ ...base, '.next/server/chunks/x.js': 'var g=require("groq-sdk");' });
  try {
    const r = check(dir);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /\.next\/server\/chunks\/x\.js groq-sdk/);
  } finally { removeFixture(dir); }
});

test('TERM-AC-10 check-groq exits 2 when the build is missing and --no-build is not given', () => {
  const dir = makeFixture(roots);
  try {
    assert.equal(check(dir).status, 2);
    assert.equal(check(dir, ['--no-build']).status, 0);
  } finally { removeFixture(dir); }
});

test('TERM-AC-10 the real src/ has no api.groq.com and no Groq SDK import', () => {
  const r = runScript('check-groq.mjs', ['--no-build']);
  assert.equal(r.status, 0, r.out);
});
