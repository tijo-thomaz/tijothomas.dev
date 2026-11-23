// PLAT-AC-19 (Verify: unit): `spec:check` fails on an uncited AC, on an unknown cited ID and on a
// stale specs/pending.txt entry, and exits 0 on the real repo.
// Contract under test: node scripts/spec-check.mjs [--root <dir>]  (default root: cwd)
// Fixture AC IDs are built at runtime (prefix FIX) so this file never cites an unknown ID itself.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { loadPaths, makeFixture, removeFixture, requireScript, runScript, readPkg } from './lib/test-utils.mjs';

const P = 'FIX';
const ac = (n) => `${P}-AC-${String(n).padStart(2, '0')}`;
const specLine = (id) => `- **${id}** — Given a, when b, then c. _Traces: FR-001 · Verify: unit_`;
const retiredLine = (id) => `- ~~**${id}** — Given a, when b, then c.~~ (retired: duplicate) _Traces: FR-001 · Verify: unit_`;
const specFile = (lines) => ['# Fixture', 'Status: Draft', `Prefix: ${P}`, 'Traces: FR-001', '', '## Acceptance criteria', ...lines, ''].join('\n');

let unitDir; // a folder vitest collects, taken from paths.mjs so this file names no source folder
let pathsError;
const fixtures = [];
before(async () => {
  try { unitDir = (await loadPaths()).srcRoots?.[0]; } catch (e) { pathsError = e; }
});
after(() => fixtures.forEach(removeFixture));

function fixture({ spec, pending = '', unit = '', e2e = '', gate = '', nodeTest = '' }) {
  requireScript('spec-check.mjs'); // report the missing feature first, then the missing paths.mjs
  if (pathsError) throw pathsError;
  assert.ok(unitDir, 'paths.srcRoots is empty');
  const optional = { [`${unitDir}/thing.test.ts`]: unit, 'e2e/thing.spec.ts': e2e, 'scripts/check-thing.mjs': gate, 'scripts/thing.test.mjs': nodeTest };
  const files = { 'specs/fixture.md': spec, 'specs/pending.txt': pending,
    ...Object.fromEntries(Object.entries(optional).filter(([, content]) => content)) };
  const dir = makeFixture(files);
  fixtures.push(dir);
  return dir;
}
const unitTest = (...ids) => `import { it } from 'vitest';\n${ids.map((id) => `it('${id} works', () => {});`).join('\n')}\n`;
const e2eTest = (...ids) => `import { test } from '@playwright/test';\n${ids.map((id) => `test('${id} loads', async () => {});`).join('\n')}\n`;
const gateScript = (...ids) => ids.map((id) => `console.log('PASS ${id} gate check');`).join('\n');
const specCheck = (root) => runScript('spec-check.mjs', ['--root', root]);

test('PLAT-AC-19 spec:check exits 0 when every AC is cited by a unit test, an e2e test or a gate check', () => {
  const root = fixture({ spec: specFile([specLine(ac(1)), specLine(ac(2)), specLine(ac(3))]),
    unit: unitTest(ac(1)), e2e: e2eTest(ac(2)), gate: gateScript(ac(3)) });
  const r = specCheck(root);
  assert.equal(r.status, 0, r.out);
});

test('PLAT-AC-19 spec:check counts AC IDs cited in scripts/*.test.mjs node:test files', () => {
  const root = fixture({ spec: specFile([specLine(ac(1))]), nodeTest: `test('${ac(1)} repo check', () => {});\n` });
  const r = specCheck(root);
  assert.equal(r.status, 0, r.out);
});

test('PLAT-AC-19 spec:check fails and names an AC that no test or gate cites', () => {
  const root = fixture({ spec: specFile([specLine(ac(1)), specLine(ac(2))]), unit: unitTest(ac(1)) });
  const r = specCheck(root);
  assert.notEqual(r.status, 0, `expected non-zero exit\n${r.out}`);
  assert.match(r.out, new RegExp(ac(2)));
});

test('PLAT-AC-19 spec:check fails and names an unknown AC ID cited by a unit test', () => {
  const root = fixture({ spec: specFile([specLine(ac(1))]), unit: unitTest(ac(1), ac(9)) });
  const r = specCheck(root);
  assert.notEqual(r.status, 0, `expected non-zero exit\n${r.out}`);
  assert.match(r.out, new RegExp(ac(9)));
});

test('PLAT-AC-19 spec:check fails and names an unknown AC ID cited by an e2e test', () => {
  const root = fixture({ spec: specFile([specLine(ac(1))]), unit: unitTest(ac(1)), e2e: e2eTest(ac(8)) });
  const r = specCheck(root);
  assert.notEqual(r.status, 0, `expected non-zero exit\n${r.out}`);
  assert.match(r.out, new RegExp(ac(8)));
});

test('PLAT-AC-19 spec:check does not require a citation for a struck-through retired AC', () => {
  const root = fixture({ spec: specFile([specLine(ac(1)), retiredLine(ac(2))]), unit: unitTest(ac(1)) });
  const r = specCheck(root);
  assert.equal(r.status, 0, r.out);
});

test('PLAT-AC-19 spec:check accepts an uncited AC that is listed in specs/pending.txt', () => {
  const root = fixture({ spec: specFile([specLine(ac(1)), specLine(ac(2))]), unit: unitTest(ac(1)), pending: `${ac(2)}\n` });
  const r = specCheck(root);
  assert.equal(r.status, 0, r.out);
});

test('PLAT-AC-19 spec:check fails and names a stale pending.txt entry that a test already cites', () => {
  const root = fixture({ spec: specFile([specLine(ac(1)), specLine(ac(2))]), unit: unitTest(ac(1), ac(2)), pending: `${ac(2)}\n` });
  const r = specCheck(root);
  assert.notEqual(r.status, 0, `expected non-zero exit\n${r.out}`);
  assert.match(r.out, new RegExp(ac(2)));
});

test('PLAT-AC-19 spec:check fails and names a pending.txt entry that is not an AC in specs/', () => {
  const root = fixture({ spec: specFile([specLine(ac(1))]), unit: unitTest(ac(1)), pending: `${ac(7)}\n` });
  const r = specCheck(root);
  assert.notEqual(r.status, 0, `expected non-zero exit\n${r.out}`);
  assert.match(r.out, new RegExp(ac(7)));
});

test('PLAT-AC-19 spec:check fails when it finds 0 ACs in specs/ (no vacuous pass)', () => {
  const root = fixture({ spec: '# Empty\nStatus: Draft\n', unit: unitTest() });
  const r = specCheck(root);
  assert.notEqual(r.status, 0, `expected non-zero exit on an empty spec set\n${r.out}`);
});

test('PLAT-AC-19 npm run spec:check is defined and runs scripts/spec-check.mjs', () => {
  assert.match(readPkg().scripts?.['spec:check'] ?? '', /node\s+scripts\/spec-check\.mjs/);
});

test('PLAT-AC-19 spec:check exits 0 on the real repo', () => {
  const r = runScript('spec-check.mjs');
  assert.equal(r.status, 0, r.out);
});
