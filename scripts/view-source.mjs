#!/usr/bin/env node
// View-source gate: the server HTML of `/` (no JavaScript) contains every expected visible string.
// Enforced from U-07 (SEO-AC-09): the expected strings come from the content modules.
// Usage: node scripts/view-source.mjs [--url <url>] [--expect <strings.json>] [--out <dir>] [--root <dir>]
//   no --url: starts `next start` on a free port from the existing build (CG1 must have run).
//   --expect: JSON array of strings, instead of the content-derived list. 0 expectations is a FAIL.
// Writes <out>/view-source.json (HTML size, visible-text length, h1 count, missing strings).
import fs from 'node:fs';
import path from 'node:path';
import { cliOptions, startNext, writeJson } from './lib/gate-utils.mjs';
import { expectedStrings } from './lib/content-strings.mjs';

const opts = cliOptions();
const root = path.resolve(opts.get('--root', process.cwd()));
const outDir = opts.get('--out') && path.resolve(root, opts.get('--out'));
const expectFile = opts.get('--expect');

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };
const decode = (s) => s.replace(/&(#\d+|#x[\da-f]+|\w+);/gi, (m, e) => {
  if (ENTITIES[e]) return ENTITIES[e];
  if (/^#x/i.test(e)) return String.fromCodePoint(parseInt(e.slice(2), 16));
  return e.startsWith('#') ? String.fromCodePoint(Number(e.slice(1))) : m;
});
const visibleText = (html) => decode(html
  .replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const norm = (s) => s.replace(/\s+/g, ' ').trim();

// Default (SEO-AC-09, U-07): every string `/` renders, built from src/content with the same
// SHOW_PLANNED rule the page uses at build time.
const expected = expectFile
  ? JSON.parse(fs.readFileSync(path.resolve(root, expectFile), 'utf8'))
  : await expectedStrings({ showPlanned: process.env.SHOW_PLANNED === 'true' });
const server = opts.get('--url') ? null : await startNext(root);
const url = opts.get('--url') ?? server.url;
try {
  const res = await fetch(url, { headers: { 'user-agent': 'view-source-gate' } });
  const html = await res.text();
  const text = visibleText(html);
  const missing = expected.filter((s) => !text.includes(norm(s)));
  const checks = [
    [`GET / returns 200 (got ${res.status})`, res.status === 200],
    [`expected strings configured (${expected.length})`, expected.length > 0],
    [`all expected strings in the server HTML (${expected.length - missing.length}/${expected.length})`, missing.length === 0],
  ];
  for (const [label, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} view-source ${label}`);
  for (const s of missing.slice(0, 50)) console.log(`  - missing: ${JSON.stringify(s)}`);
  if (outDir) {
    writeJson(path.join(outDir, 'view-source.json'), {
      url: opts.get('--url') ?? '/ (next start, local production build)', status: res.status, htmlBytes: html.length,
      visibleTextLength: text.length, h1Count: (html.match(/<h1[\s>]/gi) ?? []).length,
      expected: expected.length, missing, visibleTextSample: text.slice(0, 500),
    });
  }
  process.exitCode = checks.every(([, ok]) => ok) ? 0 : 1;
} finally {
  server?.stop();
}
