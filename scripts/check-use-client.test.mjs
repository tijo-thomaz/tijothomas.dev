// HOME-AC-03 (U-06, Verify: gate): behaviour of scripts/check-use-client.mjs on temp fixtures.
// The public site ((site) routes, components, content, lib and their local imports) ships no
// "use client" module of our own; bare imports are limited to next, react and @vercel/analytics;
// the build marks / as static (prerender-manifest.json).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeFixture, removeFixture, runScript, readText } from './lib/test-utils.mjs';
import { paths } from './paths.mjs';

const { site: SITE, components: COMP, content: CONTENT, lib: LIB, terminal: TERM } = paths.layers;
const SRC = COMP.split('/').slice(0, -1).join('/');
const up = (from) => '../'.repeat(from.split('/').length);
const base = {
  'tsconfig.json': JSON.stringify({ compilerOptions: { paths: { '@/*': ['./src/*'] } } }),
  [`${SITE}/layout.tsx`]: "import { Analytics } from '@vercel/analytics/react';\nexport default function L({ children }) { return children; }\n",
  [`${SITE}/page.tsx`]: `import { Hero } from '${up(SITE)}${COMP}/Hero';\nimport { profile } from '@/content/profile';\nexport default function P() { return Hero({ profile }); }\n`,
  [`${COMP}/Hero.tsx`]: "import type { ReactNode } from 'react';\nexport function Hero(p): ReactNode { return null; }\n",
  [`${CONTENT}/profile.ts`]: "export const profile = { name: 'x' };\n",
  [`${LIB}/flags.ts`]: 'export const f = 1;\n',
  [`${TERM}/Client.tsx`]: "'use client';\nexport const C = 1;\n",
  '.next/prerender-manifest.json': JSON.stringify({ routes: { '/': {}, '/terminal': {} } }),
};
const check = (dir, args = []) => runScript('check-use-client.mjs', ['--root', dir, ...args]);
const withFiles = (files, fn) => {
  const dir = makeFixture({ ...base, ...files });
  try { fn(dir); } finally { removeFixture(dir); }
};

test('HOME-AC-03 check-use-client passes a clean site (terminal client modules are out of scope)', () => {
  withFiles({}, (dir) => {
    const r = check(dir);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS HOME-AC-03/);
  });
});

test('HOME-AC-03 check-use-client fails and names a component with a "use client" directive', () => {
  withFiles({ [`${COMP}/Menu.tsx`]: '"use client";\nexport const M = 1;\n' }, (dir) => {
    const r = check(dir);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, new RegExp(`${COMP}/Menu\\.tsx`));
  });
});

test('HOME-AC-03 check-use-client follows local imports out of the site layers', () => {
  withFiles({
    [`${COMP}/Hero.tsx`]: "import { w } from '@/widgets/w';\nexport function Hero() { return w; }\n",
    [`${SRC}/widgets/w.ts`]: "// header comment\n'use client';\nexport const w = 1;\n",
  }, (dir) => {
    const r = check(dir);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, new RegExp(`${SRC}/widgets/w`));
  });
});

test('HOME-AC-03 check-use-client fails on a bare import outside next, react and @vercel/analytics', () => {
  withFiles({ [`${COMP}/Hero.tsx`]: "import { motion } from 'framer-motion';\nexport function Hero() { return motion; }\n" }, (dir) => {
    const r = check(dir);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /framer-motion/);
  });
});

test('HOME-AC-03 check-use-client ignores "use client" inside a string or a test file', () => {
  withFiles({
    [`${LIB}/doc.ts`]: "export const doc = 'add \"use client\" only in the terminal';\n",
    [`${COMP}/Hero.test.tsx`]: "'use client';\nimport { x } from 'vitest';\n",
  }, (dir) => {
    const r = check(dir);
    assert.equal(r.status, 0, r.out);
  });
});

test('HOME-AC-03 check-use-client fails when the build does not prerender / as static', () => {
  withFiles({ '.next/prerender-manifest.json': JSON.stringify({ routes: { '/terminal': {} } }) }, (dir) => {
    const r = check(dir);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /FAIL HOME-AC-03 .*static/);
  });
});

test('HOME-AC-03 check-use-client exits 2 with no build unless --no-build', () => {
  const dir = makeFixture(Object.fromEntries(Object.entries(base).filter(([k]) => !k.startsWith('.next'))));
  try {
    assert.equal(check(dir).status, 2);
    assert.equal(check(dir, ['--no-build']).status, 0);
  } finally { removeFixture(dir); }
});

test('HOME-AC-03 gates.yml has an enforced gate that runs scripts/check-use-client.mjs', () => {
  const block = readText('gates.yml').split(/\n\s*-\s+id:\s*/).find((b) => /node scripts\/check-use-client\.mjs/.test(b));
  assert.ok(block, 'no gate runs scripts/check-use-client.mjs');
  assert.match(block, /enforce:\s*true/);
});
