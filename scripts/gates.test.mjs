// U-01 walking skeleton: gates.yml lists the required gates, and scripts/gates.mjs runs them.
// Gate wiring for PLAT-AC-14, PLAT-AC-16 (CG2/CG7), PLAT-AC-18 (check-gitignore), PLAT-AC-19
// (spec:check) and PLAT-AC-25 (CG10 SBOM, gitleaks, npm audit signatures).
// Runner contract under test: node scripts/gates.mjs [--root <dir>] [--unit <U-NN>] [--only id1,id2]
//   exit 0 only if every enforced gate in the run passes; one JSON per gate in
//   <root>/edd-docs/construction/<unit>/gates/ with at least { id, enforce, exitCode, status: 'pass'|'fail' }.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { makeFixture, readPkg, readText, removeFixture, repoFile, runScript } from './lib/test-utils.mjs';

const GATES = 'gates.yml';

// Minimal reader for a `gates:` list. Accepts block entries (`- id: x` + indented keys) and
// flow entries (`- { id: x, cmd: "...", ... }`).
function readGates(text) {
  const body = text.split(/\r?\n/);
  const start = body.findIndex((l) => /^gates\s*:/.test(l));
  assert.ok(start >= 0, `${GATES} has no top-level gates: list`);
  const chunks = [];
  for (const line of body.slice(start + 1)) {
    if (/^\S/.test(line)) break; // next top-level key
    if (/^\s*-\s/.test(line)) chunks.push(line.replace(/^\s*-\s/, ''));
    else if (chunks.length && line.trim() && !line.trim().startsWith('#')) chunks[chunks.length - 1] += `\n${line}`;
  }
  const field = (chunk, key) => {
    const m = chunk.match(new RegExp(`(?:^|[\\s{,])${key}\\s*:\\s*("((?:\\\\.|[^"\\\\])*)"|'([^']*)'|[^,}\\n#]+)`));
    if (!m) return undefined;
    return (m[2] ?? m[3] ?? m[1]).trim();
  };
  return chunks.map((c) => ({ id: field(c, 'id'), cmd: field(c, 'cmd'), enforce: field(c, 'enforce'), evidence: field(c, 'evidence') }));
}
const loadGates = () => {
  assert.ok(fs.existsSync(repoFile(GATES)), `${GATES} does not exist at the repo root`);
  return readGates(readText(GATES));
};
const byId = (gates, re) => gates.filter((g) => re.test(g.id ?? ''));
const cmdsOf = (gates, re) => byId(gates, re).map((g) => g.cmd).join(' && ');

test('U-01 gates.yml exists and every entry has id, cmd, enforce and evidence', () => {
  const gates = loadGates();
  assert.ok(gates.length > 0, 'gates.yml lists no gates');
  const bad = gates.filter((g) => !g.id || !g.cmd || !/^(true|false)$/.test(g.enforce ?? '') || !g.evidence)
    .map((g) => JSON.stringify(g));
  assert.deepEqual(bad, []);
  const ids = gates.map((g) => g.id);
  assert.deepEqual(ids.filter((id, i) => ids.indexOf(id) !== i), [], 'duplicate gate ids');
});

test('U-01 gates.yml lists CG1-CG5, CG7, CG9, CG10, CG14, spec, deps, gitignore, lighthouse and view-source', () => {
  const gates = loadGates();
  const required = {
    CG1: /^CG1(_|$)/, CG2: /^CG2(_|$)/, CG3: /^CG3(_|$)/, CG4: /^CG4(_|$)/, CG5: /^CG5(_|$)/, CG7: /^CG7(_|$)/,
    CG9: /^CG9(_|$)/, CG10: /^CG10(_|$)/, CG14: /^CG14(_|$)/,
    spec: /spec/i, deps: /deps/i, gitignore: /gitignore/i, lighthouse: /lighthouse/i, 'view-source': /view-?source/i,
  };
  const missing = Object.entries(required).filter(([, re]) => byId(gates, re).length === 0).map(([k]) => k);
  assert.deepEqual(missing, []);
});

test('U-01 lighthouse and view-source are report-only; every other gate is enforced', () => {
  const gates = loadGates();
  const reportOnly = /lighthouse|view-?source/i;
  const wrong = gates.filter((g) => (reportOnly.test(g.id) ? g.enforce !== 'false' : g.enforce !== 'true'))
    .map((g) => `${g.id}: enforce ${g.enforce}`);
  assert.deepEqual(wrong, []);
});

test('PLAT-AC-14 PLAT-AC-16 CG2 and CG7 run npm run lint (Oxlint)', () => {
  const gates = loadGates();
  assert.match(cmdsOf(gates, /^CG2(_|$)/), /npm run lint|oxlint/);
  assert.match(cmdsOf(gates, /^CG7(_|$)/), /npm run lint|oxlint/);
});

test('U-01 CG1 builds, CG3 type-checks, CG4 runs vitest and the scripts node:test suite, CG5 measures coverage', () => {
  const gates = loadGates();
  assert.match(cmdsOf(gates, /^CG1(_|$)/), /npm run build|next build|node scripts\/build-no-env\.mjs/); // U-02: CG1 builds via build-no-env (runs npm run build)
  assert.match(cmdsOf(gates, /^CG3(_|$)/), /tsc --noEmit|npm run type-check/);
  const cg4 = cmdsOf(gates, /^CG4(_|$)/);
  assert.match(cg4, /vitest|check-vitest-config|npm (run )?test(\s|$|&)/);
  assert.match(cg4, /node --test|test:scripts/);
  assert.match(cmdsOf(gates, /^CG5(_|$)/), /coverage/);
});

test('U-01 CG9 runs check-unreachable, deps runs check-deps, CG14 runs a docs check', () => {
  const gates = loadGates();
  assert.match(cmdsOf(gates, /^CG9(_|$)/), /scripts\/check-unreachable\.mjs/);
  assert.match(cmdsOf(gates, /deps/i), /scripts\/check-deps\.mjs/);
  assert.match(cmdsOf(gates, /^CG14(_|$)/), /scripts\/\S+\.mjs/);
});

test('PLAT-AC-18 gates.yml runs scripts/check-gitignore.mjs', () => {
  assert.match(cmdsOf(loadGates(), /gitignore/i), /scripts\/check-gitignore\.mjs/);
});

test('PLAT-AC-19 gates.yml runs spec:check', () => {
  assert.match(cmdsOf(loadGates(), /spec/i), /npm run spec:check|scripts\/spec-check\.mjs/);
});

test('PLAT-AC-25 CG10 runs npm audit, gitleaks over history and working tree, npm audit signatures and the SBOM script', () => {
  const cg10 = cmdsOf(loadGates(), /^CG10(_|$)/);
  const problems = [
    [/npm audit(?! signatures)/, 'npm audit'],
    [/npm audit signatures/, 'npm audit signatures'],
    [/gitleaks (detect|git)(?![^&|;]*--no-git)/, 'gitleaks over git history'],
    [/gitleaks (dir|detect[^&|;]*--no-git)/, 'gitleaks over the working tree'],
    [/scripts\/sbom\.mjs/, 'scripts/sbom.mjs'],
  ].filter(([re]) => !re.test(cg10)).map(([, name]) => `missing: ${name}`);
  assert.deepEqual(problems, [], `CG10 cmds: ${cg10}`);
});

test('U-01 every scripts/*.mjs that gates.yml references exists', () => {
  const refs = [...new Set(loadGates().flatMap((g) => [...(g.cmd ?? '').matchAll(/scripts\/[\w./-]+\.mjs/g)].map((m) => m[0])))];
  assert.ok(refs.length > 0, 'gates.yml references no scripts');
  assert.deepEqual(refs.filter((r) => !fs.existsSync(repoFile(r))), []);
});

test('U-01 package.json defines lint, spec:check, gates (scripts/gates.mjs) and test:e2e', () => {
  const s = readPkg().scripts ?? {};
  const missing = ['lint', 'spec:check', 'gates', 'test:e2e'].filter((k) => !s[k]);
  assert.deepEqual(missing, []);
  assert.match(s.gates, /node\s+scripts\/gates\.mjs/);
});

// ---- runner behaviour on a fixture gates.yml ----
const fixtures = [];
after(() => fixtures.forEach(removeFixture));
function runnerFixture() {
  const dir = makeFixture({
    'pass.mjs': 'process.exit(0);\n',
    'fail.mjs': 'console.log("boom"); process.exit(3);\n',
    'gates.yml': [
      'gates:',
      '  - id: ok',
      '    cmd: node pass.mjs',
      '    enforce: true',
      '    evidence: stdout',
      '  - id: bad',
      '    cmd: node fail.mjs',
      '    enforce: true',
      '    evidence: stdout',
      '  - id: report',
      '    cmd: node fail.mjs',
      '    enforce: false',
      '    evidence: stdout',
      '',
    ].join('\n'),
  });
  fixtures.push(dir);
  return dir;
}
const evidenceDir = (root) => path.join(root, 'edd-docs', 'construction', 'U-99', 'gates');
const evidence = (root) => (fs.existsSync(evidenceDir(root)) ? fs.readdirSync(evidenceDir(root)) : [])
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(evidenceDir(root), f), 'utf8')));

test('U-01 gates runner exits 0 when enforced gates pass even if a report-only gate fails', () => {
  const root = runnerFixture();
  const r = runScript('gates.mjs', ['--root', root, '--unit', 'U-99', '--only', 'ok,report']);
  assert.equal(r.status, 0, r.out);
});

test('U-01 gates runner exits non-zero and names the failing enforced gate', () => {
  const root = runnerFixture();
  const r = runScript('gates.mjs', ['--root', root, '--unit', 'U-99']);
  assert.notEqual(r.status, 0, r.out);
  assert.match(r.out, /\bbad\b/);
});

test('U-01 gates runner writes one JSON per gate with id, enforce, exitCode and status', () => {
  const root = runnerFixture();
  runScript('gates.mjs', ['--root', root, '--unit', 'U-99']);
  const got = Object.fromEntries(evidence(root).map((e) => [e.id, e]));
  assert.deepEqual(Object.keys(got).sort(), ['bad', 'ok', 'report']);
  assert.deepEqual([got.ok.status, got.bad.status, got.report.status], ['pass', 'fail', 'fail']);
  assert.deepEqual([got.ok.exitCode, got.bad.exitCode], [0, 3]);
  assert.deepEqual([got.ok.enforce, got.report.enforce], [true, false]);
});

test('U-01 gates runner --only runs just the listed gates', () => {
  const root = runnerFixture();
  const r = runScript('gates.mjs', ['--root', root, '--unit', 'U-99', '--only', 'ok']);
  assert.equal(r.status, 0, r.out);
  assert.deepEqual(evidence(root).map((e) => e.id), ['ok']);
});
