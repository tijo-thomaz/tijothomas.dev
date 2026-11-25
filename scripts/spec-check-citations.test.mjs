// PLAT-AC-19 (review fix): only test titles and gate check strings cite an AC; comments and other
// code in test files do not. Fixture AC IDs are built at runtime so this file cites none itself.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { makeFixture, removeFixture, runScript } from './lib/test-utils.mjs';

const id = (n) => [`FIX`, 'AC', String(n).padStart(2, '0')].join('-');
const spec = (...ids) => ['# Fixture', 'Status: Draft', 'Prefix: FIX', '', ...ids.map((x) => `- **${x}** — Given a, then b. _Verify: unit_`), ''].join('\n');
const fixtures = [];
after(() => fixtures.forEach(removeFixture));
const check = (files) => {
  const dir = makeFixture({ 'specs/pending.txt': '', ...files });
  fixtures.push(dir);
  return runScript('spec-check.mjs', ['--root', dir]);
};

test('PLAT-AC-19 spec:check does not count an AC ID that appears only in a test-file comment', () => {
  const r = check({ 'specs/f.md': spec(id(1)), 'e2e/a.spec.ts': `// covers ${id(1)}\ntest('loads', () => {});\n` });
  assert.notEqual(r.status, 0, r.out);
  assert.match(r.out, new RegExp(`uncited: ${id(1)}`));
});

test('PLAT-AC-19 spec:check does not count an AC ID in test-file code outside a test title', () => {
  const r = check({ 'specs/f.md': spec(id(1)), 'e2e/a.spec.ts': `const x = '${id(1)}';\ntest('loads', () => {});\n` });
  assert.notEqual(r.status, 0, r.out);
});

test('PLAT-AC-19 spec:check counts describe titles and modifiers such as test.skip', () => {
  const r = check({ 'specs/f.md': spec(id(1), id(2)), 'e2e/a.spec.ts': `describe('${id(1)} group', () => {});\ntest.skip('${id(2)} later', () => {});\n` });
  assert.equal(r.status, 0, r.out);
});

test('PLAT-AC-19 spec:check does not count an AC ID in a gate-script comment', () => {
  const r = check({ 'specs/f.md': spec(id(1)), 'scripts/check-x.mjs': `// gate for ${id(1)}\nconsole.log('PASS x');\n` });
  assert.notEqual(r.status, 0, r.out);
});
