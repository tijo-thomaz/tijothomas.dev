// PLAT-AC-12 (U-03 review minor carried to U-04): check-unreachable also scans e2e/ specs and the
// real import statements of scripts/*.test.mjs for imports of missing modules. Fixture source
// embedded in string literals of node:test files is not an import and must not be flagged.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeFixture, removeFixture, runScript } from './lib/test-utils.mjs';
import { paths } from './paths.mjs';

// Folder names come from scripts/paths.mjs (U-01 DoD). The app entry imports the lib module.
const APP = paths.entries[0];
const LIB = paths.layers.lib;
const base = {
  [`${APP}/page.tsx`]: `import { x } from '${'../'.repeat(APP.split('/').length)}${LIB}/x';\nexport default function P() { return x; }\n`,
  [`${LIB}/x.ts`]: 'export const x = 1;\n',
  'edd-docs/audit/raw/cycles.txt': 'gone/a.ts\n',
  'edd-docs/construction/U-00/unreachable.txt': 'gone/b.ts\n',
};
const check = (dir) => runScript('check-unreachable.mjs', ['--root', dir]);

test('PLAT-AC-12 U-04 check-unreachable passes on a clean fixture with e2e and scripts tests', () => {
  const dir = makeFixture({
    ...base,
    'e2e/home.spec.ts': "import { x } from '../src/lib/x';\n",
    'scripts/a.test.mjs': "import fs from 'node:fs';\nconst fixture = `import y from './nope';`;\n",
  });
  try {
    const r = check(dir);
    assert.equal(r.status, 0, r.out);
  } finally { removeFixture(dir); }
});

test('PLAT-AC-12 U-04 check-unreachable fails and names an e2e spec that imports a missing module', () => {
  const dir = makeFixture({ ...base, 'e2e/chat.spec.ts': "import { M } from '../src/terminal/gone';\n" });
  try {
    const r = check(dir);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /e2e\/chat\.spec\.ts imports missing module/);
  } finally { removeFixture(dir); }
});

test('PLAT-AC-12 U-04 check-unreachable fails and names a scripts test whose import statement points to a missing module', () => {
  const dir = makeFixture({ ...base, 'scripts/b.test.mjs': "import { h } from './lib/gone.mjs';\n" });
  try {
    const r = check(dir);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /scripts\/b\.test\.mjs imports missing module/);
  } finally { removeFixture(dir); }
});

const KEEP = 'scripts/check-unreachable.keep.txt';
const orphan = { [`${LIB}/later.ts`]: 'export const later = 1;\n', [`${LIB}/later.test.ts`]: "import { later } from './later';\n" };

test('PLAT-AC-11 PLAT-AC-12 U-05 an unimported module and its test fail the check when not keep-listed', () => {
  const dir = makeFixture({ ...base, ...orphan });
  try {
    const r = check(dir);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, new RegExp(`unreachable: ${LIB}/later\\.ts`));
    assert.match(r.out, new RegExp(`${LIB}/later\\.test\\.ts imports dead module`));
  } finally { removeFixture(dir); }
});

test('PLAT-AC-11 PLAT-AC-12 U-05 a keep-listed module with a reason is neither unreachable nor dead for its test', () => {
  const dir = makeFixture({ ...base, ...orphan, [KEEP]: `# header comment\n${LIB}/later.ts  # used from U-07\n` });
  try {
    const r = check(dir);
    assert.equal(r.status, 0, r.out);
  } finally { removeFixture(dir); }
});

// U-05 review #2: stale or over-broad keep entries fail.
for (const [label, keepLine, expected] of [
  ['a module that a route now imports', `${LIB}/x.ts  # kept`, /now reachable, remove the entry: .*x\.ts/],
  ['a module that no longer exists', `${LIB}/nope.ts  # kept`, /missing, remove the entry: .*nope\.ts/],
  ['a path on the audited deletion list', 'gone/a.ts  # kept', /names an audited deletion.*gone\/a\.ts/],
]) {
  test(`PLAT-AC-11 U-05 a keep entry for ${label} fails and is named`, () => {
    const dir = makeFixture({ ...base, [KEEP]: `${keepLine}\n`, ...(label.includes('audited') ? { 'gone/a.ts': 'export const a = 1;\n' } : {}) });
    try {
      const r = check(dir);
      assert.equal(r.status, 1, r.out);
      assert.match(r.out, expected);
    } finally { removeFixture(dir); }
  });
}

test('PLAT-AC-11 U-05 a keep-list entry without a # reason fails and is named', () => {
  const dir = makeFixture({ ...base, ...orphan, [KEEP]: `${LIB}/later.ts\n` });
  try {
    const r = check(dir);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, new RegExp(`no # reason: ${LIB}/later\\.ts`));
  } finally { removeFixture(dir); }
});
