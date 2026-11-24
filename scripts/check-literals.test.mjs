// CONT-AC-12 (U-06, Verify: gate): behaviour of scripts/check-literals.mjs on temp fixtures.
// No string literal or JSX text of more than 3 words in src/components/** (tests aside), except
// className values and entries of scripts/literals-allowlist.json (each with a reason).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeFixture, removeFixture, runScript, readText } from './lib/test-utils.mjs';
import { paths } from './paths.mjs';

const COMP = paths.layers.components;
const ALLOW = 'scripts/literals-allowlist.json';
const clean = [
  "import type { Profile } from '@/content/types';",
  'export function Hero({ hero }: { hero: Profile["hero"] }) {',
  '  return (',
  '    <section id="top" className="hero hero--wide band">',
  '      <nav aria-label="Main">{hero.tip}</nav>',
  '      <p className={`hero-line ${hero.tip ? "a b c d" : ""}`}>{hero.intro} · ©</p>',
  '    </section>',
  '  );',
  '}',
  '',
].join('\n');
const check = (dir) => runScript('check-literals.mjs', ['--root', dir]);
const withFiles = (files, fn) => {
  const dir = makeFixture({ [`${COMP}/Hero.tsx`]: clean, [ALLOW]: JSON.stringify({ allow: [] }), ...files });
  try { fn(dir); } finally { removeFixture(dir); }
};

test('CONT-AC-12 check-literals passes components whose text comes from content props', () => {
  withFiles({}, (dir) => {
    const r = check(dir);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS CONT-AC-12/);
  });
});

test('CONT-AC-12 check-literals fails and names JSX text of more than 3 words', () => {
  withFiles({ [`${COMP}/Footer.tsx`]: 'export const F = () => <footer>Built with React and Go</footer>;\n' }, (dir) => {
    const r = check(dir);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, new RegExp(`${COMP}/Footer\\.tsx:1 .*Built with React and Go`));
  });
});

test('CONT-AC-12 check-literals fails on a string literal of more than 3 words (attribute or code)', () => {
  withFiles({ [`${COMP}/Nav.tsx`]: 'export const N = () => <a title="Read the case study now" href="#x">x</a>;\n' }, (dir) => {
    const r = check(dir);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /Read the case study now/);
  });
});

// U-06 review #2: text next to an {expression}, and visible text containing "//", must be seen.
for (const [label, src, expected] of [
  ['JSX text that sits next to an {expression}', 'export const P = ({ city }) => <p>I am a senior engineer based in {city}</p>;\n', /I am a senior engineer based in/],
  ['JSX text containing a URL with //', 'export const P = () => <p>See https://example.com for the full story</p>;\n', /for the full story/],
  ['a template literal with an expression', 'export const t = (n) => `Open to roles in ${n} and nearby cities`;\n', /nearby cities/],
]) {
  test(`CONT-AC-12 check-literals fails on ${label}`, () => {
    withFiles({ [`${COMP}/P.tsx`]: src }, (dir) => {
      const r = check(dir);
      assert.equal(r.status, 1, r.out);
      assert.match(r.out, expected);
    });
  });
}

test('CONT-AC-12 check-literals also scans the (site) route files (page and layout)', () => {
  withFiles({ [`${paths.layers.site}/page.tsx`]: 'export default function P() { return <main>Welcome to my little corner of the web</main>; }\n' }, (dir) => {
    const r = check(dir);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /Welcome to my little corner/);
  });
});

test('CONT-AC-12 U-08 check-literals does not count SVG path data or coordinates as words, but still counts copy beside numbers', () => {
  withFiles({ [`${COMP}/geo.ts`]: 'export const d = "M-7.0 -160.8 L0.0 -152.8 L7.0 -160.8 Z";\nexport const p = "1,2 3,4 5,6 7,8";\n' }, (dir) => {
    assert.equal(check(dir).status, 0);
  });
  withFiles({ [`${COMP}/copy.tsx`]: 'export const C = () => <p>9+ years shipping production software</p>;\n' }, (dir) => {
    const r = check(dir);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /years shipping production software/);
  });
});

test('CONT-AC-12 check-literals skips comments and test files', () => {
  withFiles({
    [`${COMP}/Nav.tsx`]: '// This comment has many words in it\nexport const N = 1;\n',
    [`${COMP}/Nav.test.tsx`]: "it('renders the nav with five links', () => {});\n",
  }, (dir) => {
    const r = check(dir);
    assert.equal(r.status, 0, r.out);
  });
});

test('CONT-AC-12 check-literals honours allow-list entries, and each entry needs a reason', () => {
  const bad = { [`${COMP}/Map.tsx`]: 'export const M = () => <svg aria-label="map of the whole city" />;\n' };
  withFiles({ ...bad, [ALLOW]: JSON.stringify({ allow: [{ match: 'map of the whole city', reason: 'fixture' }] }) }, (dir) => {
    assert.equal(check(dir).status, 0);
  });
  withFiles({ ...bad, [ALLOW]: JSON.stringify({ allow: [{ match: 'map of the whole city' }] }) }, (dir) => {
    const r = check(dir);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /reason/);
  });
});

test('CONT-AC-12 gates.yml has an enforced gate that runs scripts/check-literals.mjs', () => {
  const block = readText('gates.yml').split(/\n\s*-\s+id:\s*/).find((b) => /node scripts\/check-literals\.mjs/.test(b));
  assert.ok(block, 'no gate runs scripts/check-literals.mjs');
  assert.match(block, /enforce:\s*true/);
});
