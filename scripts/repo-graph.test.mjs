// PLAT-AC-11 / PLAT-AC-12 re-verified on src/ (U-03): the shared import graph must resolve `@/x`
// through the tsconfig `@/*` target (./src/* after U-03), otherwise every `@/` import becomes
// "unresolved" and check-unreachable / check-imports silently lose edges.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeFixture, removeFixture, runScript, specLayout } from './lib/test-utils.mjs';
import { resolveLocal } from './lib/repo-graph.mjs';

const L = specLayout();
const SRC = L.src;
const tsconfig = (target) => JSON.stringify({ compilerOptions: { baseUrl: '.', paths: { '@/*': [target] } } });

test('PLAT-AC-11 repo-graph resolves @/ imports through the fixture tsconfig target ./src/*', () => {
  const dir = makeFixture({
    'tsconfig.json': tsconfig(L.aliasTarget),
    [`${SRC}/lib/site.ts`]: "export const siteUrl = 'x';\n",
    [`${SRC}/terminal/ui/index.tsx`]: 'export const U = 1;\n',
  });
  try {
    assert.equal(resolveLocal(dir, `${SRC}/app/page.tsx`, '@/lib/site'), `${SRC}/lib/site.ts`);
    assert.equal(resolveLocal(dir, `${SRC}/app/page.tsx`, '@/terminal/ui'), `${SRC}/terminal/ui/index.tsx`);
  } finally { removeFixture(dir); }
});

test('PLAT-AC-11 repo-graph still resolves relative imports inside src/', () => {
  const dir = makeFixture({ 'tsconfig.json': tsconfig(L.aliasTarget), [`${SRC}/lib/a.ts`]: 'export const a = 1;\n' });
  try {
    assert.equal(resolveLocal(dir, `${SRC}/lib/b.ts`, './a'), `${SRC}/lib/a.ts`);
  } finally { removeFixture(dir); }
});

test('PLAT-AC-11 PLAT-AC-12 check-unreachable exits 0 on the real repo with entries under src/app', () => {
  const r = runScript('check-unreachable.mjs');
  assert.equal(r.status, 0, r.out);
  const entries = (r.out.match(/^entries: (.*)$/m) ?? [])[1] ?? '';
  assert.ok(entries.split(', ').every((e) => e.startsWith(`${SRC}/app/`)), `entries not under ${SRC}/app: ${entries}`);
  assert.ok(entries.includes(`${SRC}/app/(site)/page.tsx`) && entries.includes(`${SRC}/app/(terminal)/terminal/page.tsx`), entries);
});
