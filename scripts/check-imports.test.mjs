// PLAT-AC-09 and HOME-AC-04 (Verify: gate): behaviour of scripts/check-imports.mjs on temp fixtures,
// plus one run on the real repo.
//
// Contract (U-03 scope 5):
//   node scripts/check-imports.mjs [--root <dir>]        exit 0 = all pass, 1 = any FAIL
//   - Layers come from scripts/paths.mjs `layers` { site, components, content, lib, terminal }.
//   - `@/x` resolves through <root>/tsconfig.json compilerOptions.paths['@/*'][0]; relative,
//     `import()`, `next/dynamic(() => import())`, `export … from` and `require()` count as edges.
//   - PLAT-AC-09: 0 import cycles; components/content/lib never import terminal; terminal never
//     imports components or content; content has `import type` / `export type` imports only.
//   - HOME-AC-04: the closure of every route file under layers.site has no module under
//     layers.terminal and no module that imports `@supabase/*`.
//   - Each check prints `PASS|FAIL <AC-ID> <name>`; failures list `from -> to` (or the cycle).
//   - 0 site route files or 0 modules is a FAIL (no vacuous pass).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  loadPaths, makeFixture, readText, removeFixture, runScript, specLayout,
} from './lib/test-utils.mjs';

const L = specLayout();
const SRC = L.src;

async function layers() {
  const p = await loadPaths();
  assert.ok(p.layers, 'scripts/paths.mjs has no `layers` map yet');
  return p.layers;
}

// `@/` specifier for a repo path under src/ (alias target ./src/* from PLAT-AC-08).
const alias = (rel) => `@/${rel.slice(SRC.length + 1).replace(/\.tsx?$/, '')}`;

// A clean fixture: site page -> components -> lib; terminal -> lib; content has type imports only.
async function cleanFiles() {
  const y = await layers();
  return {
    'tsconfig.json': JSON.stringify({ compilerOptions: { baseUrl: '.', paths: { '@/*': [L.aliasTarget] } } }),
    'package.json': '{"name":"fixture","private":true}',
    [`${y.site}/layout.tsx`]: `import { Shell } from '${alias(`${y.components}/Shell.tsx`)}';\nexport default function L({ children }) { return <Shell>{children}</Shell>; }\n`,
    [`${y.site}/page.tsx`]: `import { siteUrl } from '${alias(`${y.lib}/site.ts`)}';\nimport type { Profile } from '${alias(`${y.content}/types.ts`)}';\nexport default function P() { return <main>{siteUrl}</main>; }\n`,
    [`${y.components}/Shell.tsx`]: `import { cn } from '${alias(`${y.lib}/utils.ts`)}';\nexport const Shell = ({ children }) => <div className={cn('a')}>{children}</div>;\n`,
    [`${y.lib}/utils.ts`]: 'export const cn = (...a) => a.join(" ");\n',
    [`${y.lib}/site.ts`]: "export const siteUrl = 'https://example.test';\n",
    [`${y.content}/types.ts`]: 'export type Profile = { name: string };\n',
    [`${y.content}/profile.ts`]: `import type { Profile } from './types';\nexport type { Profile };\nexport const profile: Profile = { name: 'x' };\n`,
    [`${y.terminal}/page.tsx`]: `import { cn } from '${alias(`${y.lib}/utils.ts`)}';\nimport { db } from './lib/supabase';\nexport default function T() { return <div className={cn(String(db))} />; }\n`,
    [`${y.terminal}/lib/supabase.ts`]: "import { createClient } from '@supabase/supabase-js';\nexport const db = createClient('u', 'k');\n",
    [`${SRC}/app/(terminal)/terminal/page.tsx`]: `export { default } from '${alias(`${y.terminal}/page.tsx`)}';\n`,
    [`${SRC}/app/(terminal)/layout.tsx`]: 'export default function L({ children }) { return children; }\n',
  };
}

async function run(overrides = {}) {
  const dir = makeFixture({ ...(await cleanFiles()), ...overrides });
  try {
    return runScript('check-imports.mjs', ['--root', dir]);
  } finally {
    removeFixture(dir);
  }
}

test('PLAT-AC-09 HOME-AC-04 check-imports exits 0 on a fixture that follows every direction rule', async () => {
  const r = await run();
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /PASS PLAT-AC-09 /);
  assert.match(r.out, /PASS HOME-AC-04 /);
  assert.doesNotMatch(r.out, /FAIL/);
});

test('PLAT-AC-09 check-imports fails and names the edge when src/components imports src/terminal through @/', async () => {
  const y = await layers();
  const r = await run({ [`${y.components}/Bad.tsx`]: `import T from '${alias(`${y.terminal}/page.tsx`)}';\nexport const Bad = T;\n` });
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /FAIL PLAT-AC-09 /);
  assert.ok(r.out.includes(`${y.components}/Bad.tsx -> ${y.terminal}/page.tsx`), r.out);
});

test('PLAT-AC-09 check-imports fails when src/lib imports src/terminal through a relative path', async () => {
  const y = await layers();
  const r = await run({ [`${y.lib}/bad.ts`]: "export { db } from '../terminal/lib/supabase';\n" });
  assert.equal(r.status, 1, r.out);
  assert.ok(r.out.includes(`${y.lib}/bad.ts -> ${y.terminal}/lib/supabase.ts`), r.out);
});

test('PLAT-AC-09 check-imports fails when src/content imports src/terminal, even type-only', async () => {
  const y = await layers();
  const r = await run({ [`${y.content}/bad.ts`]: `import type { db } from '${alias(`${y.terminal}/lib/supabase.ts`)}';\nexport type X = typeof db;\n` });
  assert.equal(r.status, 1, r.out);
  assert.ok(r.out.includes(`${y.content}/bad.ts -> ${y.terminal}/lib/supabase.ts`), r.out);
});

test('PLAT-AC-09 check-imports fails when src/terminal imports src/components', async () => {
  const y = await layers();
  const r = await run({ [`${y.terminal}/Bad.tsx`]: `import { Shell } from '${alias(`${y.components}/Shell.tsx`)}';\nexport const B = Shell;\n` });
  assert.equal(r.status, 1, r.out);
  assert.ok(r.out.includes(`${y.terminal}/Bad.tsx -> ${y.components}/Shell.tsx`), r.out);
});

test('PLAT-AC-09 check-imports fails when src/terminal imports src/content through a dynamic import()', async () => {
  const y = await layers();
  const r = await run({ [`${y.terminal}/Lazy.tsx`]: `export const load = () => import('${alias(`${y.content}/profile.ts`)}');\n` });
  assert.equal(r.status, 1, r.out);
  assert.ok(r.out.includes(`${y.terminal}/Lazy.tsx -> ${y.content}/profile.ts`), r.out);
});

test('PLAT-AC-09 check-imports allows src/terminal to import src/lib (shared helpers)', async () => {
  const r = await run(); // the clean fixture's terminal page imports lib/utils
  assert.equal(r.status, 0, r.out);
});

test('PLAT-AC-09 check-imports fails when src/content has a value import (types only)', async () => {
  const y = await layers();
  const r = await run({ [`${y.content}/data.ts`]: `import { siteUrl } from '${alias(`${y.lib}/site.ts`)}';\nexport const home = siteUrl;\n` });
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /FAIL PLAT-AC-09 [^\n]*type/i);
  assert.ok(r.out.includes(`${y.content}/data.ts`), r.out);
});

test('PLAT-AC-09 check-imports fails and prints the cycle when two src/lib modules import each other', async () => {
  const y = await layers();
  const r = await run({
    [`${y.lib}/a.ts`]: "import { b } from './b';\nexport const a = () => b();\n",
    [`${y.lib}/b.ts`]: "import { a } from './a';\nexport const b = () => a;\n",
  });
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /FAIL PLAT-AC-09 [^\n]*cycle/i);
  assert.ok(r.out.includes(`${y.lib}/a.ts`) && r.out.includes(`${y.lib}/b.ts`), r.out);
});

test('HOME-AC-04 check-imports fails when a (site) route imports src/terminal', async () => {
  const y = await layers();
  const r = await run({ [`${y.site}/page.tsx`]: `import T from '${alias(`${y.terminal}/page.tsx`)}';\nexport default T;\n` });
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /FAIL HOME-AC-04 /);
  assert.ok(r.out.includes(`${y.terminal}/page.tsx`), r.out);
});

test('HOME-AC-04 check-imports fails when the (site) graph reaches @supabase/* transitively (site -> components -> lib)', async () => {
  const y = await layers();
  const r = await run({
    [`${y.lib}/db.ts`]: "import { createClient } from '@supabase/supabase-js';\nexport const db = createClient('u', 'k');\n",
    [`${y.components}/Shell.tsx`]: `import { db } from '${alias(`${y.lib}/db.ts`)}';\nexport const Shell = ({ children }) => <div data-db={String(db)}>{children}</div>;\n`,
  });
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /FAIL HOME-AC-04 [^\n]*[Ss]upabase/);
  assert.ok(r.out.includes(`${y.lib}/db.ts`), r.out);
});

test('HOME-AC-04 check-imports ignores Supabase use inside src/terminal (not reachable from (site))', async () => {
  const r = await run(); // clean fixture: terminal/lib/supabase imports @supabase/supabase-js
  assert.equal(r.status, 0, r.out);
});

test('PLAT-AC-09 HOME-AC-04 check-imports fails when it finds 0 (site) route files (no vacuous pass)', async () => {
  const y = await layers();
  const files = await cleanFiles();
  for (const k of Object.keys(files)) if (k.startsWith(`${y.site}/`)) delete files[k];
  const dir = makeFixture(files);
  try {
    const r = runScript('check-imports.mjs', ['--root', dir]);
    assert.notEqual(r.status, 0, r.out);
    assert.match(r.out, /FAIL HOME-AC-04 /);
  } finally {
    removeFixture(dir);
  }
});

test('PLAT-AC-09 HOME-AC-04 check-imports exits 0 on the real repo', () => {
  const r = runScript('check-imports.mjs');
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /PASS PLAT-AC-09 /);
  assert.match(r.out, /PASS HOME-AC-04 /);
});

test('PLAT-AC-09 HOME-AC-04 gates.yml CG9_import_graph runs scripts/check-imports.mjs', () => {
  const block = readText('gates.yml').split(/\n\s*-\s+id:\s*/).find((b) => b.startsWith('CG9_import_graph'));
  assert.ok(block, 'gates.yml has no CG9_import_graph gate');
  assert.match(block, /node scripts\/check-imports\.mjs/);
  assert.match(block, /node scripts\/check-unreachable\.mjs/, 'CG9 must keep the PLAT-AC-11/12 check');
});
