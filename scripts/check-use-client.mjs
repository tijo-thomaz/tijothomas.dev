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
// Exact package specifiers only (U-06 review #3). next/link, next/image, next/dynamic and next/script
// are client modules or inject client JS, so they are not allowed. Add an entry only with a reason.
const ALLOWED_PACKAGES = new Set([
  'next', // types (Metadata, Viewport)
  'next/font/google', // build-time font loading
  'next/font/local',
  'react', // types and server components
  'react-dom',
  '@vercel/analytics/react', // the one client package HOME-AC-03 allows
]);
// The directive prologue: the leading run of string-literal statements. "use client" anywhere in it
// counts ('use strict'; 'use client'; included).
const PROLOGUE = /^(?:\s*(['"])[^'"\n]*\1\s*;?)+/;
const hasUseClient = (code) => /(['"])use client\1/.test(code.match(PROLOGUE)?.[0] ?? '');

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
  if (hasUseClient(stripComments(src))) clientModules.push(f);
  for (const s of specifiers(src)) {
    const r = resolveLocal(root, f, s);
    if (typeof r === 'string') stack.push(r);
    else if (r === null && !ALLOWED_PACKAGES.has(s)) badPackages.push(`${f} imports ${s}`);
    else if (r && typeof r === 'object') badPackages.push(`${f} has an unresolved local import ${s}`);
  }
}

let failed = false;
const report = (name, problems) => {
  if (problems.length) failed = true;
  console.log(`${problems.length ? 'FAIL' : 'PASS'} HOME-AC-03 ${name}${problems.length ? ` (${problems.length})` : ''}`);
  for (const p of problems) console.log(`  - ${p}`);
};

report(`site modules and their local imports have no "use client" directive (${seen.size} modules)`, clientModules.sort());
report("site modules import only allowed packages and resolve every local import", [...new Set(badPackages)].sort());
if (withBuild) {
  const routes = JSON.parse(fs.readFileSync(manifest, 'utf8')).routes ?? {};
  report('the build marks / as static (prerender-manifest.json)', '/' in routes ? [] : ['/ is not prerendered']);
}
process.exit(failed ? 1 : 0);
