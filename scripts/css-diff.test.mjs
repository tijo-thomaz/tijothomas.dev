// R17 / PLAT-AC-06 (DoD "CSS-diff evidence"): behaviour of scripts/css-diff.mjs, the generalised
// U-00 smoke/cssdiff.mjs, on fixture CSS and source trees.
//
// Contract (U-03 scope 5):
//   node scripts/css-diff.mjs --base <base.css> --head <head.css> [--root <dir>] [--out <file>]
//   - Classes = class selectors of each CSS file, unescaped (`.md\:text-5xl:hover` -> md:text-5xl),
//     read from selectors only: comments and declaration values (`0.5rem`) never yield a class.
//   - "Used" = the class appears as a whole token in a non-test .ts/.tsx/.js/.jsx file under
//     scripts/paths.mjs srcRoots (relative to --root, default cwd). `*.test.*` / `*.spec.*` never count.
//   - Prints: `base <n> HEAD <n> | removed <n>, removed-but-used <n> | added <n>`,
//     `MISSING-USED: <classes>|(none)`, `ADDED: <classes>|(none)`, and
//     `PASS|FAIL PLAT-AC-06 css-diff <n> missing`. --out writes the same report to a file.
//   - Exit 0 when 0 removed classes are used, 1 when any is; exit 2 on a missing input file or a
//     CSS file with 0 class selectors (no vacuous pass).
// The DoD build step (Tailwind at the last pre-U-03 commit and at HEAD, in scratchpad worktrees) is
// manual, see edd-docs/construction/U-03/test-plan.md section 4.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { loadPaths, makeFixture, removeFixture, runScript } from './lib/test-utils.mjs';

const BASE_CSS = [
  '/* .ghost-class { color: red } */',
  '.flex{display:flex}',
  '.h-6{height:1.5rem}',
  '.px-2\\.5{padding-left:0.625rem;padding-right:0.625rem}',
  '.min-w-\\[180px\\]{min-width:180px}',
  '.hover\\:bg-blue-700:hover{background-color:#1d4ed8}',
  '@media (min-width:768px){.md\\:text-5xl{font-size:3rem}}',
  '.theme-cyber .only-in-tests{color:red}',
].join('\n');
const HEAD_CSS = '.flex{display:flex}\n.theme-cyber{color:red}\n.new-added{opacity:.25}\n';

async function fixture(srcFiles, { base = BASE_CSS, head = HEAD_CSS } = {}) {
  const { srcRoots } = await loadPaths();
  const root = srcRoots[0];
  const files = { 'base.css': base, 'head.css': head };
  for (const [rel, content] of Object.entries(srcFiles)) files[rel.replace('<src>', root)] = content;
  return makeFixture(files);
}

async function diff(srcFiles, opts, extraArgs = []) {
  const dir = await fixture(srcFiles, opts);
  try {
    return { ...runScript('css-diff.mjs', ['--base', 'base.css', '--head', 'head.css', '--root', dir, ...extraArgs], { cwd: dir }), dir };
  } finally {
    if (!extraArgs.includes('--out')) removeFixture(dir);
  }
}

const line = (out, key) => (out.match(new RegExp(`^${key}: (.*)$`, 'm')) ?? [])[1] ?? '';

test('PLAT-AC-06 css-diff exits 0 and reports 0 missing when HEAD keeps every class that src/ uses', async () => {
  const r = await diff({ '<src>/A.tsx': 'export const A = () => <div className="flex" />;\n' });
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /removed-but-used 0/);
  assert.equal(line(r.out, 'MISSING-USED'), '(none)');
  assert.match(r.out, /PASS PLAT-AC-06 css-diff 0 missing/);
});

test('PLAT-AC-06 css-diff fails and lists removed classes still used in src/, unescaping variants, decimals and arbitrary values', async () => {
  const src = 'export const A = () => <p className={`md:text-5xl px-2.5 ${x}`} data-c="min-w-[180px] hover:bg-blue-700" />;\n';
  const r = await diff({ '<src>/deep/A.tsx': src });
  assert.equal(r.status, 1, r.out);
  const missing = line(r.out, 'MISSING-USED').split(/\s+/).sort();
  assert.deepEqual(missing, ['hover:bg-blue-700', 'md:text-5xl', 'min-w-[180px]', 'px-2.5']);
  assert.match(r.out, /FAIL PLAT-AC-06 css-diff 4 missing/);
});

test('PLAT-AC-06 css-diff counts whole tokens only (h-64 in source does not make a removed h-6 "used")', async () => {
  const r = await diff({ '<src>/A.tsx': 'export const A = () => <div className="h-64 flex" />;\n' });
  assert.equal(r.status, 0, r.out);
  assert.equal(line(r.out, 'MISSING-USED'), '(none)');
});

test('PLAT-AC-06 css-diff ignores uses in *.test.* files and in folders outside paths.srcRoots', async () => {
  const r = await diff({
    '<src>/A.test.tsx': 'it("x", () => render(<div className="md:text-5xl only-in-tests" />));\n',
    'outside-src/B.tsx': 'export const B = () => <div className="md:text-5xl" />;\n',
  });
  assert.equal(r.status, 0, r.out);
  assert.equal(line(r.out, 'MISSING-USED'), '(none)');
});

test('PLAT-AC-06 css-diff reads classes from selectors only: comments and declaration values are not classes', async () => {
  const r = await diff({ '<src>/A.tsx': 'export const A = () => <div className="ghost-class 625rem 5rem" />;\n' });
  assert.equal(r.status, 0, r.out);
  // base: flex h-6 px-2.5 min-w-[180px] hover:bg-blue-700 md:text-5xl theme-cyber only-in-tests = 8
  assert.match(r.out, /^base 8 HEAD 3 \| removed 6, removed-but-used 0 \| added 1$/m);
});

test('PLAT-AC-06 css-diff lists classes added at HEAD', async () => {
  const r = await diff({});
  assert.equal(line(r.out, 'ADDED'), 'new-added');
});

test('PLAT-AC-06 css-diff --out writes the same report to a file', async () => {
  const r = await diff({ '<src>/A.tsx': 'export const A = () => <div className="flex" />;\n' }, undefined, ['--out', 'report/css-diff.txt']);
  try {
    const file = path.join(r.dir, 'report/css-diff.txt');
    assert.ok(fs.existsSync(file), 'no --out file written');
    const text = fs.readFileSync(file, 'utf8');
    assert.match(text, /^base 8 HEAD 3 \|/m);
    assert.match(text, /^MISSING-USED: \(none\)$/m);
  } finally {
    removeFixture(r.dir);
  }
});

test('PLAT-AC-06 css-diff exits 2 when an input CSS file is missing', async () => {
  const dir = await fixture({});
  try {
    const r = runScript('css-diff.mjs', ['--base', 'base.css', '--head', 'nope.css', '--root', dir], { cwd: dir });
    assert.equal(r.status, 2, r.out);
  } finally { removeFixture(dir); }
});

test('PLAT-AC-06 css-diff exits 2 when a CSS file has 0 class selectors (no vacuous pass)', async () => {
  const r = await diff({}, { head: '/* empty build */\n' });
  assert.equal(r.status, 2, r.out);
});
