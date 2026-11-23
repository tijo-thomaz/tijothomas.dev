// PLAT-AC-14 (static part), PLAT-AC-15 (Verify: unit), PLAT-AC-16 (static part).
// The runtime part of PLAT-AC-14/16 (oxlint exits 0 in <= 5 s, warning ceiling) is the CG2/CG7 gate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadPaths, readJsonc, readPkg, readText, walkRepo } from './lib/test-utils.mjs';

const CONFIG = '.oxlintrc.json';
const BASELINE_WARNINGS = 262; // SP-02 measured ceiling; may only go down
const norm = (rule) => rule.replace(/^eslint\//, '');
const level = (v) => {
  const s = Array.isArray(v) ? v[0] : v;
  return s === 2 ? 'error' : s === 1 ? 'warn' : s === 0 ? 'off' : s;
};
const opts = (v) => (Array.isArray(v) ? v[1] ?? {} : {});
const warnRules = (rules = {}) => Object.entries(rules).filter(([, v]) => level(v) === 'warn').map(([k]) => k);

test('PLAT-AC-14 .oxlintrc.json at the repo root enables react, nextjs, jsx-a11y, typescript and vitest', () => {
  const cfg = readJsonc(CONFIG);
  const missing = ['react', 'nextjs', 'jsx-a11y', 'typescript', 'vitest'].filter((p) => !(cfg.plugins ?? []).includes(p));
  assert.deepEqual(missing, [], `plugins missing from ${CONFIG}`);
});

test('PLAT-AC-14 npm run lint runs oxlint with --max-warnings at or below the 262 baseline', () => {
  const lint = readPkg().scripts?.lint ?? '';
  assert.match(lint, /^oxlint(\s|$)/, `scripts.lint is '${lint}'`);
  const m = lint.match(/--max-warnings[ =](\d+)/);
  assert.ok(m, `scripts.lint has no --max-warnings ceiling: '${lint}'`);
  assert.ok(Number(m[1]) <= BASELINE_WARNINGS, `--max-warnings ${m[1]} is above the ${BASELINE_WARNINGS} baseline`);
});

test('PLAT-AC-14 oxlint is an exact-pinned devDependency', () => {
  const v = readPkg().devDependencies?.oxlint;
  assert.ok(v, 'oxlint is not in devDependencies');
  assert.match(v, /^\d+\.\d+\.\d+$/, `oxlint version '${v}' is not an exact pin`);
});

test('PLAT-AC-14 no rule or category is a warning outside the legacy-terminal override', () => {
  const cfg = readJsonc(CONFIG);
  assert.equal(cfg.categories?.correctness, 'error', 'categories.correctness must be "error" (Oxlint defaults it to warn)');
  const warnCats = Object.entries(cfg.categories ?? {}).filter(([, v]) => level(v) === 'warn').map(([k]) => k);
  assert.deepEqual(warnCats, [], 'categories set to warn');
  assert.deepEqual(warnRules(cfg.rules), [], 'top-level rules set to warn');
  const warnOverrides = (cfg.overrides ?? []).filter((o) => warnRules(o.rules).length > 0);
  assert.equal(warnOverrides.length, 1, `expected exactly 1 override with warn rules, found ${warnOverrides.length}`);
});

test('PLAT-AC-14 the legacy-terminal override lists exactly paths.terminalGlobs', async () => {
  const { terminalGlobs } = await loadPaths();
  const cfg = readJsonc(CONFIG);
  assert.match(readText(CONFIG), /legacy-terminal/, 'the warn override is not labelled legacy-terminal');
  const legacy = (cfg.overrides ?? []).find((o) => warnRules(o.rules).length > 0);
  assert.ok(legacy, 'no legacy-terminal override with warn rules');
  assert.deepEqual([...legacy.files].sort(), [...terminalGlobs].sort());
});

test('PLAT-AC-14 the test-file override comes after the legacy-terminal override so it wins', () => {
  const overrides = readJsonc(CONFIG).overrides ?? [];
  const legacyIdx = overrides.findIndex((o) => warnRules(o.rules).length > 0);
  const testIdx = overrides.findIndex((o) => (o.files ?? []).some((f) => /\.(test|spec)\./.test(f)));
  assert.ok(legacyIdx >= 0, 'no legacy-terminal override');
  if (testIdx >= 0) assert.ok(testIdx > legacyIdx, `test-file override (#${testIdx}) must come after legacy (#${legacyIdx})`);
});

test('PLAT-AC-16 CG7 limits are error-level Oxlint rules: complexity 10, max-lines 400, function 50, params 4, depth 3', () => {
  const rules = Object.fromEntries(Object.entries(readJsonc(CONFIG).rules ?? {}).map(([k, v]) => [norm(k), v]));
  const want = { complexity: 10, 'max-lines': 400, 'max-lines-per-function': 50, 'max-params': 4, 'max-depth': 3 };
  const problems = Object.entries(want).flatMap(([rule, max]) => {
    const v = rules[rule];
    if (v === undefined) return [`${rule}: missing`];
    const errs = [];
    if (level(v) !== 'error') errs.push(`${rule}: level ${level(v)}, want error`);
    if (opts(v).max !== max) errs.push(`${rule}: max ${opts(v).max}, want ${max}`);
    return errs;
  });
  assert.deepEqual(problems, []);
});

test('PLAT-AC-15 repo has no .eslintrc* or eslint.config.* file', () => {
  const files = walkRepo();
  assert.ok(files.length > 0, 'repo walk found no files');
  const found = files.filter((f) => /(^|\/)(\.eslintrc(\.[\w]+)?|eslint\.config\.[cm]?[jt]s)$/.test(f));
  assert.deepEqual(found, []);
});

test('PLAT-AC-15 package.json has no eslintConfig key and no eslint* dependency', () => {
  const pkg = readPkg();
  assert.equal('eslintConfig' in pkg, false, 'package.json still has eslintConfig');
  const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies, ...pkg.optionalDependencies, ...pkg.peerDependencies });
  assert.deepEqual(deps.filter((d) => /(^|\/)eslint/.test(d)), []);
});

test('PLAT-AC-15 no package.json script calls eslint or next lint', () => {
  const offending = Object.entries(readPkg().scripts ?? {}).filter(([, c]) => /\beslint\b|next\s+lint/.test(c)).map(([n]) => n);
  assert.deepEqual(offending, []);
});
