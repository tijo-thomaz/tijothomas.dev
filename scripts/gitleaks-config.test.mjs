// PLAT-AC-25: the CG10 working-tree secret scan uses .gitleaks.toml, whose allowlist covers only
// git-ignored build/dependency folders, so a real secret in a normal (trackable) file still fails it.
// Needs gitleaks (found by scripts/require-tool.mjs); the gitleaks tests skip, never pass, without it.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { makeFixture, readText, removeFixture, repoFile, runScript } from './lib/test-utils.mjs';

const CONFIG = '.gitleaks.toml';
const ALLOWED = ['.next', 'node_modules', '.claude', 'coverage', 'test-results', 'playwright-report'];
// Built at runtime so this file never contains a key-shaped literal for the real scan to flag.
// AWS access key ids are AKIA + 16 base32 characters (A-Z, 2-7); the value is fake.
const fakeAwsKey = () => ['AKIA', 'ZTQ2M4NX', 'P3R5T6WK'].join('');
const fixtures = [];
after(() => fixtures.forEach(removeFixture));

function scan(files) {
  const dir = makeFixture(files);
  fixtures.push(dir);
  return runScript('require-tool.mjs', ['gitleaks', 'dir', dir, '--config', repoFile(CONFIG), '--no-banner', '--redact']);
}

test('PLAT-AC-25 CG10 gitleaks tree gate runs gitleaks dir with --config .gitleaks.toml', () => {
  assert.match(readText('gates.yml'), /gitleaks dir [^\n]*--config \.gitleaks\.toml/);
});

test('PLAT-AC-25 .gitleaks.toml extends the default rules and allowlists only git-ignored output folders', () => {
  const cfg = readText(CONFIG);
  assert.match(cfg, /\[extend\][\s\S]*?useDefault\s*=\s*true/);
  const listed = [...cfg.matchAll(/'''([^']*)'''/g)].map((m) => m[1]);
  const want = ALLOWED.map((d) => `(^|[\\\\/])${d.replaceAll('.', '\\.')}[\\\\/]`);
  assert.deepEqual([...listed].sort(), [...want].sort());
  assert.doesNotMatch(cfg, /^\s*(regexes|stopwords|commits)\s*=/m, 'no regex/stopword/commit allowlists');
});

test('PLAT-AC-25 gitleaks with .gitleaks.toml fails on a secret in a trackable source file', (t) => {
  const r = scan({ 'config.ts': `export const awsKeyId = '${fakeAwsKey()}';\n` });
  if (r.status === 78) return t.skip('gitleaks not installed');
  assert.notEqual(r.status, 0, r.out);
  assert.match(r.out, /leaks found: [1-9]/i);
});

test('PLAT-AC-25 gitleaks with .gitleaks.toml ignores the same secret inside .next/ only', (t) => {
  const inside = path.join('.next', 'server', 'chunk.js');
  const r = scan({ [inside]: `const k = '${fakeAwsKey()}';\n` });
  if (r.status === 78) return t.skip('gitleaks not installed');
  assert.equal(r.status, 0, r.out);
  // Non-vacuous: the same file one level up (not in an allowlisted folder) is reported.
  const control = scan({ [path.join('server', 'chunk.js')]: `const k = '${fakeAwsKey()}';\n` });
  assert.notEqual(control.status, 0, control.out);
  assert.ok(fs.existsSync(repoFile(CONFIG)));
});
