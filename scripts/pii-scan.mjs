#!/usr/bin/env node
// CONT-AC-14 (U-04): no contact PII in anything the site serves.
// Usage: node scripts/pii-scan.mjs [--root <dir>] [--allow <file>]
// Scans what a production build serves: prerendered HTML, RSC payloads and route bodies under
// .next/server/app (.html, .rsc, .body) and the text assets under .next/static. Server code, trace
// manifests (.nft.json), metadata and the build cache are not served, so they are not scanned.
// Patterns: email, mailto:, tel:, wa.me, phone-like run /\+?\d[\d\s().-]{8,}\d/ (CONT-AC-14), with
// \s narrowed to space and tab so a run stays on one line.
// Built-in non-contact rules for phone-like runs (number shapes no phone number has):
//   R1 part of a longer token (hex hash, identifier, decimal): touches [A-Za-z0-9_.$]
//   R2 fewer than 10 or more than 15 digits (E.164 and UK numbers have 10-15)
//   R3 contains a plain decimal token such as 1.966 (SVG/CSS coordinates); 3+ dot groups stay a phone
//   R4 two or more single-digit groups such as "1 1 0 0 1" (SVG arc flags, number lists)
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
  ['tel', /\btel:\s*[+\d(]/gi], // a tel: link always carries a number; React's `tel:!0` input-type map does not
  ['wa.me', /wa\.me/gi],
  // R1 via the lookarounds. Separators are space, tab and ().- only: a run never crosses a line break,
  // so a phone line cannot merge with a following dates line and be discarded by R2 (U-04 review #2).
  ['phone', /(?<![\w.$])\+?\d[\d \t().-]{8,}\d(?![\w$]|\.\d)/g],
];
const SERVER_APP = '.next/server/app';
const STATIC = '.next/static';
const SERVER_APP_EXT = new Set(['.html', '.rsc', '.body']);
const STATIC_EXT = new Set(['.js', '.css', '.html', '.json', '.txt', '.rsc', '.body', '.xml']);

// R2-R4 (see header): true when a phone-like run cannot be a phone number.
function nonContactNumber(text) {
  const digits = text.replace(/\D/g, '').length;
  if (digits < 10 || digits > 15) return true;
  // R3: some token is a plain decimal (one dot), like 18.0839. A dot-separated phone number
  // (+44.7818.989.060) has three or more dot groups, so it is not skipped.
  if (text.split(/[ \t]+/).some((t) => /^[+(]?\d+\.\d+\)?$/.test(t))) return true;
  return text.split(/[\s().+-]+/).filter((g) => /^\d$/.test(g)).length >= 2;
}

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

// public/ is served verbatim (U-04 review #3), so its text files are scanned too.
const PUBLIC = 'public';
const PUBLIC_EXT = new Set(['.txt', '.xml', '.json', '.html', '.svg', '.vcf', '.webmanifest', '.md', '.csv']);
const files = [
  ...walk(path.join(root, SERVER_APP)).filter((f) => SERVER_APP_EXT.has(path.extname(f))),
  ...walk(path.join(root, STATIC)).filter((f) => STATIC_EXT.has(path.extname(f))),
];
const publicFiles = walk(path.join(root, PUBLIC)).filter((f) => PUBLIC_EXT.has(path.extname(f).toLowerCase()));
if (files.length === 0) {
  console.log(`FAIL ${TAG}: 0 files scanned under ${SERVER_APP} and ${STATIC} (run the build first) exit 2`);
  process.exit(2);
}

const { allow, problems } = readAllow();
for (const p of problems) console.log(`allow-list: ${p}`);

const rel = (f) => path.relative(root, f).split(path.sep).join('/');
const skip = (name, text) => allow.has(text) || (name === 'phone' && nonContactNumber(text));
files.push(...publicFiles);
const hits = files.flatMap((f) => {
  const text = fs.readFileSync(f, 'utf8');
  return PATTERNS.flatMap(([name, re]) => [...text.matchAll(re)]
    .filter((m) => !skip(name, m[0]))
    .map((m) => `${rel(f)}:${m.index} ${name} ${m[0]}`));
});
for (const h of hits) console.log(h);
const ok = hits.length === 0 && problems.length === 0;
console.log(ok
  ? `PASS ${TAG} (${files.length} files)`
  : `FAIL ${TAG} (${hits.length} matches, ${problems.length} allow-list problems, ${files.length} files)`);
process.exit(ok ? 0 : 1);
