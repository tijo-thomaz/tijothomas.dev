#!/usr/bin/env node
// TERM-AC-10 (U-04, ADR-P2): no route talks to Groq.
// Usage: node scripts/check-groq.mjs [--root <dir>] [--no-build]
// Searches src/ and, unless --no-build, the production build (.next/server, .next/static) for
// `api.groq.com` and Groq SDK imports (`groq-sdk`, `@ai-sdk/groq`). Prints `<file> <what>` per hit.
// Exit 0 clean, 1 hits, 2 when src/ or (without --no-build) the build is missing.
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const i = args.indexOf('--root');
const root = path.resolve(i >= 0 ? args[i + 1] : process.cwd());
const withBuild = !args.includes('--no-build');
const TAG = 'TERM-AC-10 no api.groq.com and no Groq SDK import in src/ or the build';
const NEEDLES = ['api.groq.com', 'groq-sdk', '@ai-sdk/groq'];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const dirs = ['src', ...(withBuild ? ['.next/server', '.next/static'] : [])];
const missing = dirs.filter((d) => !fs.existsSync(path.join(root, d)));
if (missing.length) {
  console.log(`FAIL ${TAG}: missing ${missing.join(', ')}${withBuild ? ' (build first, or pass --no-build)' : ''} exit 2`);
  process.exit(2);
}

const rel = (f) => path.relative(root, f).split(path.sep).join('/');
const files = dirs.flatMap((d) => walk(path.join(root, d)));
const hits = files.flatMap((f) => {
  const text = fs.readFileSync(f, 'utf8');
  return NEEDLES.filter((n) => text.includes(n)).map((n) => `${rel(f)} ${n}`);
});
for (const h of hits) console.log(h);
console.log(hits.length ? `FAIL ${TAG} (${hits.length})` : `PASS ${TAG} (${files.length} files)`);
process.exit(hits.length ? 1 : 0);
