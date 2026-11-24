#!/usr/bin/env node
// Gate for HOME-AC-03 (U-06): the public site ships no client component of our own.
// Usage: node scripts/check-use-client.mjs [--root <dir>] [--no-build]
// Starts from every non-test module in the site layers (scripts/paths.mjs: site, components, content,
// lib) and follows local imports. Fails on:
//   - a module whose first statement is a "use client" directive;
//   - a bare (package) import other than next, react or @vercel/analytics (the one allowed client
//     package, per the AC);
//   - unless --no-build: `/` missing from .next/prerender-manifest.json (not static).
// Exit 0 clean, 1 on any failure, 2 when the build is missing (and --no-build is not given).
import fs from 'node:fs';
import path from 'node:path';
import { walk, isCode, isTest, specifiers, resolveLocal, inRoots, stripComments } from './lib/repo-graph.mjs';
import { paths } from './paths.mjs';

const args = process.argv.slice(2);
const i = args.indexOf('--root');
const root = path.resolve(i >= 0 ? args[i + 1] : process.cwd());
const withBuild = !args.includes('--no-build');
const { site, components, content, lib } = paths.layers;
const SITE_LAYERS = [site, components, content, lib];
const ALLOWED_PACKAGES = /^(next|react|react-dom|@vercel\/analytics)(\/|$)/;
// A directive is the first statement: only comments and whitespace may precede it.
const DIRECTIVE = /^\s*(['"])use client\1\s*;?/;

const manifest = path.join(root, '.next/prerender-manifest.json');
if (withBuild && !fs.existsSync(manifest)) {
  console.log('FAIL HOME-AC-03 no build: .next/prerender-manifest.json is missing (build first, or pass --no-build) exit 2');
  process.exit(2);
}

const start = walk(root).filter((f) => isCode(f) && !isTest(f) && inRoots(f, SITE_LAYERS));
const seen = new Set();
const stack = [...start];
const clientModules = [];
const badPackages = [];
while (stack.length) {
  const f = stack.pop();
  if (seen.has(f)) continue;
  seen.add(f);
  const src = fs.readFileSync(path.join(root, f), 'utf8');
  if (DIRECTIVE.test(stripComments(src))) clientModules.push(f);
  for (const s of specifiers(src)) {
    const r = resolveLocal(root, f, s);
    if (typeof r === 'string') stack.push(r);
    else if (r === null && !ALLOWED_PACKAGES.test(s)) badPackages.push(`${f} imports ${s}`);
  }
}

let failed = false;
const report = (name, problems) => {
  if (problems.length) failed = true;
  console.log(`${problems.length ? 'FAIL' : 'PASS'} HOME-AC-03 ${name}${problems.length ? ` (${problems.length})` : ''}`);
  for (const p of problems) console.log(`  - ${p}`);
};

report(`site modules and their local imports have no "use client" directive (${seen.size} modules)`, clientModules.sort());
report('site modules import only next, react and @vercel/analytics packages', [...new Set(badPackages)].sort());
if (withBuild) {
  const routes = JSON.parse(fs.readFileSync(manifest, 'utf8')).routes ?? {};
  report('the build marks / as static (prerender-manifest.json)', '/' in routes ? [] : ['/ is not prerendered']);
}
process.exit(failed ? 1 : 0);
