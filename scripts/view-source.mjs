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
import { expectedStrings, forbiddenStrings } from './lib/content-strings.mjs';
import { matchHtml, textNodes } from './lib/view-source-match.mjs';

const opts = cliOptions();
const root = path.resolve(opts.get('--root', process.cwd()));
const outDir = opts.get('--out') && path.resolve(root, opts.get('--out'));
const expectFile = opts.get('--expect');

// Default (SEO-AC-09, U-07): every text node `/` renders, built from the content at --root with the
// page's own SHOW_PLANNED rule (isShowPlanned). Planned items must not appear anywhere in the HTML.
const expected = expectFile
  ? JSON.parse(fs.readFileSync(path.resolve(root, expectFile), 'utf8'))
  : await expectedStrings({ root });
const forbidden = expectFile ? [] : await forbiddenStrings({ root });
const server = opts.get('--url') ? null : await startNext(root);
const url = opts.get('--url') ?? server.url;
try {
  const res = await fetch(url, { headers: { 'user-agent': 'view-source-gate' } });
  const html = await res.text();
  const { nodes, missing, leaked } = matchHtml(html, expected, forbidden);
  const checks = [
    [`GET / returns 200 (got ${res.status})`, res.status === 200],
    [`expected strings configured (${expected.length})`, expected.length > 0],
    [`SEO-AC-09 every expected string is a whole text node in the server HTML (${expected.length - missing.length}/${expected.length})`, missing.length === 0],
    [`CONT-AC-03 no planned item in the HTML or RSC payload (${forbidden.length} checked)`, leaked.length === 0],
  ];
  for (const [label, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} view-source ${label}`);
  for (const s of missing.slice(0, 50)) console.log(`  - missing: ${JSON.stringify(s)}`);
  for (const s of leaked) console.log(`  - leaked: ${JSON.stringify(s)}`);
  if (outDir) {
    writeJson(path.join(outDir, 'view-source.json'), {
      url: opts.get('--url') ?? '/ (next start, local production build)', status: res.status, htmlBytes: html.length,
      textNodes: nodes, h1Count: (html.match(/<h1[\s>]/gi) ?? []).length,
      expected: expected.length, missing, forbidden: forbidden.length, leaked, sample: textNodes(html).slice(0, 40),
    });
  }
  process.exitCode = checks.every(([, ok]) => ok) ? 0 : 1;
} finally {
  server?.stop();
}
