// U-04: env template, Groq key and chat route removal, source-level PII, gate wiring, and the U-03
// review minors carried into U-04 (terminal og:url, dead /v1 branch, hidden SEO block).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readText, repoFile, walkRepo } from './lib/test-utils.mjs';
import { paths } from './paths.mjs';

// Folder names come from scripts/paths.mjs (U-01 DoD).
const APP = paths.entries[0];
const T = paths.layers.terminal;
const inSite = (f) => paths.siteRoots.some((r) => f.startsWith(`${r}/`));

const isTestFile = (f) => /\.(test|spec)\.[cm]?[jt]sx?$/.test(f);
const srcFiles = () => walkRepo().filter((f) => inSite(f) && fs.statSync(repoFile(f)).isFile());
const gateBlock = (re) => readText('gates.yml').split(/\n\s*-\s+id:\s*/).find((b) => re.test(b));

test('PLAT-AC-27 .env.example has no GROQ_API_KEY, SUPABASE_SERVICE_ROLE_KEY or RATE_LIMIT_REQUESTS_PER_MINUTE entry', () => {
  const env = readText('.env.example');
  for (const key of ['GROQ_API_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'RATE_LIMIT_REQUESTS_PER_MINUTE']) {
    assert.doesNotMatch(env, new RegExp(`^\\s*#?\\s*${key}\\s*=`, 'm'), `${key} is still in .env.example`);
  }
});

test('TERM-AC-09 0 files under src/ and .env.example contain GROQ_API_KEY', () => {
  const hits = [...srcFiles(), '.env.example'].filter((f) => readText(f).includes('GROQ_API_KEY'));
  assert.deepEqual(hits, []);
});

test('TERM-AC-07 the /api/chat route and its terminal handler are deleted', () => {
  for (const p of [`${APP}/api/chat`, `${T}/api/chat`]) assert.equal(fs.existsSync(repoFile(p)), false, `${p} still exists`);
});

test('TERM-AC-11 CONT-AC-14 no app source file (tests aside) holds an email address, mailto:, tel:, wa.me or a +44 number', () => {
  const email = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
  const hits = srcFiles().filter((f) => !isTestFile(f)).flatMap((f) => {
    const s = readText(f);
    return [
      email.test(s) && `${f}: email ${s.match(email)[0]}`,
      /mailto:/i.test(s) && `${f}: mailto:`,
      /\btel:/i.test(s) && `${f}: tel:`,
      /wa\.me/i.test(s) && `${f}: wa.me`,
      /\+44[\s\d]{6,}/.test(s) && `${f}: +44 number`,
    ].filter(Boolean);
  });
  assert.deepEqual(hits, []);
});

test('TERM-AC-11 the terminal contact data points to LinkedIn and GitHub', () => {
  const terminal = readText(`${T}/components/Terminal.tsx`);
  const contact = terminal.slice(terminal.indexOf('contact: ['), terminal.indexOf('],', terminal.indexOf('contact: [')));
  assert.match(contact, /linkedin\.com\/in\/tijo-j-thomaz93/);
  assert.match(contact, /github\.com\/tijo-thomaz\b/);
  assert.doesNotMatch(contact, /github\.com\/tijo-thomas\b/, 'F-68: the GitHub account is tijo-thomaz');
});

test('CONT-AC-14 gates.yml has an enforced pii-scan gate', () => {
  const b = gateBlock(/node scripts\/pii-scan\.mjs/);
  assert.ok(b, 'no gate runs scripts/pii-scan.mjs');
  assert.match(b, /enforce:\s*true/);
});

test('TERM-AC-10 gates.yml has an enforced gate that runs scripts/check-groq.mjs', () => {
  const b = gateBlock(/node scripts\/check-groq\.mjs/);
  assert.ok(b, 'no gate runs scripts/check-groq.mjs');
  assert.match(b, /enforce:\s*true/);
});

test('CONT-AC-14 scripts/pii-allowlist.json exists and every entry has a match and a reason', () => {
  const { allow } = JSON.parse(readText('scripts/pii-allowlist.json'));
  assert.ok(Array.isArray(allow));
  for (const a of allow) {
    assert.ok(typeof a.match === 'string' && a.match, JSON.stringify(a));
    assert.ok(typeof a.reason === 'string' && a.reason.trim(), JSON.stringify(a));
  }
});

test('U-04 TERM-AC-03 the terminal layout openGraph url is the /terminal URL, not the site root', () => {
  const layout = readText(`${T}/layout.tsx`);
  assert.match(layout, /url:\s*['"]https:\/\/tijothomas\.dev\/terminal['"]/);
});

test('U-04 the terminal layout has no hidden SEO block', () => {
  assert.doesNotMatch(readText(`${T}/layout.tsx`), /seo-content/);
});

test('U-04 TERM-AC-05 the VersionDropdown has no dead /v1 branch', () => {
  assert.doesNotMatch(readText(`${T}/widgets/VersionSelector/organisms/VersionDropdown.tsx`), /["']\/v1["']/);
});
