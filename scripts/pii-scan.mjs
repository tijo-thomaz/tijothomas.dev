#!/usr/bin/env node
// CONT-AC-14 (U-04): no contact PII in anything the site serves.
// Usage: node scripts/pii-scan.mjs [--root <dir>] [--allow <file>]
// Scans a production build: every file under .next/server/app (prerendered HTML, RSC payloads,
// route bodies) and the served text files under .next/static. Server-only chunks and the build
// cache are not served, so they are not scanned. Patterns: email, mailto:, tel:, wa.me, phone-like run.
// Allow-list: scripts/pii-allowlist.json { "allow": [{ "match": "<exact text>", "reason": "…" }] }.
// Prints `<file>:<offset> <pattern> <text>` per match. Exit 0 clean, 1 matches or a bad allow-list,
// 2 no build output (no vacuous pass).
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const root = path.resolve(opt('--root') ?? process.cwd());
const allowFile = path.resolve(root, opt('--allow') ?? 'scripts/pii-allowlist.json');
const TAG = 'CONT-AC-14 served build output has no email, mailto:, tel:, wa.me or phone number';

const PATTERNS = [
  ['email', /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi],
  ['mailto', /mailto:/gi],
  ['tel', /\btel:/gi],
  ['wa.me', /wa\.me/gi],
  ['phone', /\+?\d[\d\s().-]{8,}\d/g],
];
const SERVER_APP = '.next/server/app';
const STATIC = '.next/static';
const STATIC_EXT = new Set(['.js', '.css', '.html', '.json', '.txt', '.rsc', '.body', '.xml']);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function readAllow() {
  if (!fs.existsSync(allowFile)) return { allow: new Set(), problems: [`${path.relative(root, allowFile)}: missing`] };
  let data;
  try { data = JSON.parse(fs.readFileSync(allowFile, 'utf8')); } catch (e) { return { allow: new Set(), problems: [`allow-list is not JSON: ${e.message}`] }; }
  const list = Array.isArray(data.allow) ? data.allow : [];
  const problems = list.flatMap((a, i) => [
    ...(typeof a.match === 'string' && a.match ? [] : [`allow[${i}]: no match`]),
    ...(typeof a.reason === 'string' && a.reason.trim() ? [] : [`allow[${i}] (${a.match}): no reason`]),
  ]);
  return { allow: new Set(list.map((a) => a.match)), problems };
}

const files = [
  ...walk(path.join(root, SERVER_APP)),
  ...walk(path.join(root, STATIC)).filter((f) => STATIC_EXT.has(path.extname(f))),
];
if (files.length === 0) {
  console.log(`FAIL ${TAG}: 0 files scanned under ${SERVER_APP} and ${STATIC} (run the build first) exit 2`);
  process.exit(2);
}

const { allow, problems } = readAllow();
for (const p of problems) console.log(`allow-list: ${p}`);

const rel = (f) => path.relative(root, f).split(path.sep).join('/');
const hits = [];
for (const f of files) {
  const text = fs.readFileSync(f, 'utf8');
  for (const [name, re] of PATTERNS) {
    for (const m of text.matchAll(re)) {
      if (allow.has(m[0])) continue;
      hits.push(`${rel(f)}:${m.index} ${name} ${m[0]}`);
    }
  }
}
for (const h of hits) console.log(h);
const ok = hits.length === 0 && problems.length === 0;
console.log(ok
  ? `PASS ${TAG} (${files.length} files)`
  : `FAIL ${TAG} (${hits.length} matches, ${problems.length} allow-list problems, ${files.length} files)`);
process.exit(ok ? 0 : 1);
