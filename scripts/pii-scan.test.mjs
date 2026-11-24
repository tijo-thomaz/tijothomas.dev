// CONT-AC-14 (Verify: gate), U-04: behaviour of scripts/pii-scan.mjs on fake build output.
//
// Contract (U-04 unit interfaces):
//   node scripts/pii-scan.mjs [--root <dir>] [--allow <file>]
//   - Scans what the site serves from a production build: every file under <root>/.next/server/app
//     (prerendered .html, .rsc, .body, .meta) and every .js/.css/.html/.json/.txt/.rsc/.body/.xml file under <root>/.next/static.
//     Server-only chunks (.next/server/chunks) and .next/cache are not served, so they are not scanned.
//   - Patterns: email /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, `mailto:`, `tel:`, `wa.me`,
//     phone-like run /\+?\d[\d\s().-]{8,}\d/.
//   - Allow-list: <root>/scripts/pii-allowlist.json (or --allow): { "allow": [{ "match": "<exact text>",
//     "reason": "…" }] }. A match whose text equals an allowed `match` is skipped. Entries need a reason.
//   - Each match prints `<file>:<offset> <pattern> <text>` (file relative to root, POSIX).
//   - Last line `PASS CONT-AC-14 …` (exit 0) or `FAIL CONT-AC-14 … (<n> matches)` (exit 1).
//   - Exit 2 if there is no build output or 0 files were scanned (no vacuous pass).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeFixture, removeFixture, runScript } from './lib/test-utils.mjs';

const CLEAN_JS = 'self.__next_f.push([1,"hello"]);var a=1+2;';
const scan = (dir, args = []) => runScript('pii-scan.mjs', ['--root', dir, ...args]);

function build(files) {
  return makeFixture({
    '.next/server/app/index.html': '<html><body>Hello</body></html>',
    '.next/static/chunks/main.js': CLEAN_JS,
    'scripts/pii-allowlist.json': JSON.stringify({ allow: [] }),
    ...files,
  });
}

test('CONT-AC-14 pii-scan passes on clean build output', () => {
  const dir = build({});
  try {
    const r = scan(dir);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS CONT-AC-14/);
  } finally { removeFixture(dir); }
});

test('CONT-AC-14 pii-scan fails on an email address in prerendered HTML and names the file and the match', () => {
  const dir = build({ '.next/server/app/terminal.html': '<p>Email: someone.real@example.com</p>' });
  try {
    const r = scan(dir);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /\.next\/server\/app\/terminal\.html:\d+ email someone\.real@example\.com/);
    assert.match(r.out, /FAIL CONT-AC-14/);
  } finally { removeFixture(dir); }
});

for (const [name, text, pattern] of [
  ['mailto: link', 'href="mailto:x"', 'mailto'],
  ['tel: link', 'href="tel:x"', 'tel'],
  ['wa.me link', '"https://wa.me/1"', 'wa.me'],
  ['UK phone number', '"Phone: +44 7000 000000"', 'phone'],
]) {
  test(`CONT-AC-14 pii-scan fails on a ${name} in a served JS chunk`, () => {
    const dir = build({ '.next/static/chunks/app/page.js': `var x=${JSON.stringify(text)};` });
    try {
      const r = scan(dir);
      assert.equal(r.status, 1, r.out);
      assert.match(r.out, new RegExp(`\\.next/static/chunks/app/page\\.js:\\d+ ${pattern.replace('.', '\\.')}\\b`));
    } finally { removeFixture(dir); }
  });
}

test('CONT-AC-14 pii-scan scans RSC payloads under .next/server/app', () => {
  const dir = build({ '.next/server/app/terminal.rsc': '1:["$","p",null,{"children":"x@example.org"}]' });
  try {
    const r = scan(dir);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, /terminal\.rsc:\d+ email/);
  } finally { removeFixture(dir); }
});

test('CONT-AC-14 pii-scan skips an allow-listed non-contact match and requires a reason', () => {
  const allowed = build({
    '.next/static/chunks/lib.js': 'var max=4294967295000;',
    'scripts/pii-allowlist.json': JSON.stringify({ allow: [{ match: '4294967295000', reason: 'uint32 constant in a library' }] }),
  });
  const noReason = build({
    '.next/static/chunks/lib.js': 'var max=4294967295000;',
    'scripts/pii-allowlist.json': JSON.stringify({ allow: [{ match: '4294967295000' }] }),
  });
  try {
    assert.equal(scan(allowed).status, 0, scan(allowed).out);
    const r = scan(noReason);
    assert.notEqual(r.status, 0, r.out);
    assert.match(r.out, /reason/);
  } finally { removeFixture(allowed); removeFixture(noReason); }
});

test('CONT-AC-14 pii-scan does not scan server-only chunks or the build cache', () => {
  const dir = build({
    '.next/server/chunks/route.js': 'var e="owner@example.com";',
    '.next/cache/x.txt': 'owner@example.com',
  });
  try {
    const r = scan(dir);
    assert.equal(r.status, 0, r.out);
  } finally { removeFixture(dir); }
});

test('CONT-AC-14 pii-scan exits 2 when there is no build output (no vacuous pass)', () => {
  const dir = makeFixture({ 'scripts/pii-allowlist.json': JSON.stringify({ allow: [] }) });
  try {
    const r = scan(dir);
    assert.equal(r.status, 2, r.out);
  } finally { removeFixture(dir); }
});
