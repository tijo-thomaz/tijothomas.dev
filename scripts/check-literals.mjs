#!/usr/bin/env node
// Gate for CONT-AC-12 (U-06): components hold no copy. Text comes from src/content/*.ts.
// Usage: node scripts/check-literals.mjs [--root <dir>]
// Scans non-test code files under the components layer (scripts/paths.mjs) for string literals and
// JSX text of more than 3 words. Skipped: comments, className values (CSS class lists) and exact
// matches in scripts/literals-allowlist.json ({ "allow": [{ "match", "reason" }] }; reason required).
// Prints `<file>:<line> "<text>"` per hit. Exit 0 clean, 1 on any hit or a bad allow-list.
import fs from 'node:fs';
import path from 'node:path';
import { walk, isCode, isTest, inRoots, stripComments } from './lib/repo-graph.mjs';
import { paths } from './paths.mjs';

const args = process.argv.slice(2);
const i = args.indexOf('--root');
const root = path.resolve(i >= 0 ? args[i + 1] : process.cwd());
const TAG = 'CONT-AC-12';
const MAX_WORDS = 3;

const allowFile = path.join(root, 'scripts/literals-allowlist.json');
const allow = fs.existsSync(allowFile) ? JSON.parse(fs.readFileSync(allowFile, 'utf8')).allow ?? [] : [];
const badAllow = allow.filter((a) => !(typeof a.match === 'string' && a.match && typeof a.reason === 'string' && a.reason.trim()));
const allowed = new Set(allow.map((a) => a.match));

// Blank out className values so CSS class lists never count as copy, keeping line numbers.
const blank = (m) => m.replace(/[^\n]/g, ' ');
const withoutClassNames = (code) => code
  .replace(/className=(["'])[^"']*\1/g, blank)
  .replace(/className=\{`[^`]*`\}/g, blank);

const STRING = /"((?:\\.|[^"\\\n])*)"|'((?:\\.|[^'\\\n])*)'|`((?:\\.|[^`\\])*)`/g;
const JSX_TEXT = />([^<>{}]+)</g;
const words = (s) => s.replace(/\$\{[^}]*\}/g, ' ').trim().split(/\s+/).filter((w) => /[A-Za-z]/.test(w));
const lineOf = (code, index) => code.slice(0, index).split('\n').length;

const files = walk(root).filter((f) => isCode(f) && !isTest(f) && inRoots(f, [paths.layers.components]));
const hits = files.flatMap((f) => {
  const code = withoutClassNames(stripComments(fs.readFileSync(path.join(root, f), 'utf8')));
  const found = [
    ...[...code.matchAll(STRING)].map((m) => ({ text: m[1] ?? m[2] ?? m[3] ?? '', at: m.index })),
    ...[...code.matchAll(JSX_TEXT)].map((m) => ({ text: m[1], at: m.index })),
  ];
  return found
    .filter(({ text }) => words(text).length > MAX_WORDS && !allowed.has(text.trim()))
    .map(({ text, at }) => `${f}:${lineOf(code, at)} "${text.trim().replace(/\s+/g, ' ')}"`);
});

for (const a of badAllow) console.log(`  - literals-allowlist.json entry needs a match and a reason: ${JSON.stringify(a)}`);
for (const h of [...new Set(hits)].sort()) console.log(`  - ${h}`);
const failed = hits.length > 0 || badAllow.length > 0;
console.log(`${failed ? 'FAIL' : 'PASS'} ${TAG} no literal of more than ${MAX_WORDS} words in ${paths.layers.components} (${files.length} files)`);
process.exit(failed ? 1 : 0);
