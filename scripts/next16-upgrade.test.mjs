// U-02 (Next 16.4.6 + React 19 upgrade): dependency pins, installed tree, next.config, tsconfig
// rewrite and the empty-env build gate. Run: node --test scripts/*.test.mjs
// Plain node:test because vitest only collects src/ (PLAT-AC-05). No network: `npm ls` reads the
// installed node_modules; the lockfile is read from disk; build-no-env is exercised with a fake command.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import {
  makeFixture, readJsonc, readPkg, readText, removeFixture, repoFile, repoRoot, stripComments, unitBase,
} from './lib/test-utils.mjs';

const pkg = readPkg();
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
const lock = JSON.parse(readText('package-lock.json'));
const locked = (name) => lock.packages?.[`node_modules/${name}`]?.version;
const major = (v) => Number(String(v ?? '').replace(/^[^\d]*/, '').split('.')[0]);

// A range admits only major M when it is `M.x.y`, `^M.x.y` or `~M.x.y` (no `||`, no `>=`, no `*`).
const onlyMajor = (range, m) => new RegExp(`^[\\^~]?${m}\\.\\d+\\.\\d+(-[\\w.]+)?$`).test(String(range ?? ''));

function npm(args) {
  const r = spawnSync(`npm ${args}`, { cwd: repoRoot, encoding: 'utf8', shell: true, maxBuffer: 64 * 1024 * 1024, timeout: 120000 });
  return { status: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

// ---- PLAT-AC-01: manifest + lockfile pins --------------------------------------------------------
test('PLAT-AC-01 package.json pins next to exactly 16.4.6', () => {
  assert.equal(pkg.dependencies?.next, '16.4.6');
});

test('PLAT-AC-01 package.json react and react-dom ranges admit only 19.x', () => {
  assert.ok(onlyMajor(pkg.dependencies?.react, 19), `react range is ${pkg.dependencies?.react}`);
  assert.ok(onlyMajor(pkg.dependencies?.['react-dom'], 19), `react-dom range is ${pkg.dependencies?.['react-dom']}`);
});

test('PLAT-AC-01 package.json @types/react and @types/react-dom ranges admit only 19.x', () => {
  assert.ok(onlyMajor(deps['@types/react'], 19), `@types/react range is ${deps['@types/react']}`);
  assert.ok(onlyMajor(deps['@types/react-dom'], 19), `@types/react-dom range is ${deps['@types/react-dom']}`);
});

test('PLAT-AC-01 package-lock.json resolves next 16.4.6, react/react-dom 19.x and @types/react(-dom) 19.x', () => {
  const got = Object.fromEntries(['next', 'react', 'react-dom', '@types/react', '@types/react-dom'].map((n) => [n, locked(n)]));
  assert.equal(got.next, '16.4.6', JSON.stringify(got));
  for (const n of ['react', 'react-dom', '@types/react', '@types/react-dom']) assert.equal(major(got[n]), 19, `${n} locked at ${got[n]}`);
  assert.equal(got.react, got['react-dom'], 'react and react-dom must resolve to the same version');
});

test('PLAT-AC-01 SP-01 lucide-react is pinned to exactly 0.577.0 (1.x drops the Linkedin icon) in package.json and lockfile', () => {
  assert.equal(pkg.dependencies?.['lucide-react'], '0.577.0');
  assert.equal(locked('lucide-react'), '0.577.0');
});

test('PLAT-AC-01 SP-01 no dependency whose peer range excludes Next 16 / React 19 is left (eslint-config-next, @storybook/*)', () => {
  const bad = Object.keys(deps).filter((n) => n === 'eslint-config-next' || n.startsWith('@storybook/') || n === 'storybook');
  assert.deepEqual(bad, []);
});

test('PLAT-AC-01 SP-01 @next/bundle-analyzer is removed, or pinned to 16.4.6 with an analyze script that builds with --webpack and no POSIX env prefix', () => {
  const v = deps['@next/bundle-analyzer'];
  const analyze = pkg.scripts?.analyze;
  if (v === undefined) {
    assert.equal(analyze, undefined, 'analyze script left behind without @next/bundle-analyzer');
    return;
  }
  assert.equal(v, '16.4.6');
  assert.match(analyze ?? '', /--webpack\b/, `analyze script must use next build --webpack (got ${analyze})`);
  assert.doesNotMatch(analyze ?? '', /^\s*ANALYZE=/, 'POSIX `ANALYZE=true cmd` does not work on Windows');
});

test('U-02 RQ-08 dev tools: vitest and @vitest/coverage-v8 on the same 3.2.x, @playwright/test >= 1.55.1', () => {
  for (const n of ['vitest', '@vitest/coverage-v8']) assert.match(locked(n) ?? '', /^3\.2\.\d+$/, `${n} locked at ${locked(n)}`);
  assert.equal(locked('vitest'), locked('@vitest/coverage-v8'), 'vitest and coverage-v8 must match');
  const [maj, min, patch] = (locked('@playwright/test') ?? '0.0.0').split('.').map(Number);
  assert.ok(maj > 1 || (maj === 1 && (min > 55 || (min === 55 && patch >= 1))), `@playwright/test ${locked('@playwright/test')}`);
});

test('U-02 no install shortcut: .npmrc does not set legacy-peer-deps or force', () => {
  const f = repoFile('.npmrc');
  if (!fs.existsSync(f)) return;
  assert.doesNotMatch(fs.readFileSync(f, 'utf8'), /^\s*(legacy-peer-deps|force)\s*=\s*true/m);
});

// ---- PLAT-AC-01: installed tree (gate on npm ls, not the install exit code: SP-01 finding 2) ------
test('PLAT-AC-01 npm ls next react react-dom exits 0 and shows next@16.4.6, react and react-dom 19.x', () => {
  const r = npm('ls next react react-dom --json');
  const tree = JSON.parse(r.stdout || '{}');
  const top = tree.dependencies ?? {};
  assert.equal(top.next?.version, '16.4.6', `installed next ${top.next?.version}`);
  assert.equal(major(top.react?.version), 19, `installed react ${top.react?.version}`);
  assert.equal(major(top['react-dom']?.version), 19, `installed react-dom ${top['react-dom']?.version}`);
  assert.deepEqual(tree.problems ?? [], []);
  assert.equal(r.status, 0, r.stderr.slice(0, 2000));
});

test('PLAT-AC-01 npm ls --all reports no invalid, missing or extraneous entries anywhere in the tree', () => {
  const r = npm('ls --all --json');
  const problems = JSON.parse(r.stdout || '{}').problems ?? [];
  assert.deepEqual(problems.slice(0, 20), []);
  assert.equal(r.status, 0, r.stderr.slice(0, 2000));
});

// ---- PLAT-AC-02 / PLAT-AC-04: the gates that prove them stay enforced ----------------------------
function gate(id) {
  const text = readText('gates.yml').replace(/\r\n/g, '\n');
  const m = text.match(new RegExp(`- id: ${id}\\n([\\s\\S]*?)(?=\\n  - id: |$)`));
  assert.ok(m, `gates.yml has no gate ${id}`);
  const body = m[1];
  return { cmd: body.match(/cmd: (.*)/)?.[1]?.trim() ?? '', enforce: /enforce: true\b/.test(body) };
}

test('PLAT-AC-02 gates.yml CG10_audit is enforced and runs npm audit at --audit-level=high (stricter than the AC)', () => {
  const g = gate('CG10_audit');
  assert.equal(g.enforce, true);
  assert.match(g.cmd, /^npm audit --audit-level=(high|moderate|low)$/);
});

test('PLAT-AC-04 gates.yml CG3_types is enforced and runs type-check, which is tsc --noEmit', () => {
  const g = gate('CG3_types');
  assert.equal(g.enforce, true);
  assert.equal(g.cmd, 'npm run type-check');
  assert.equal(pkg.scripts?.['type-check'], 'tsc --noEmit');
});

// ---- PLAT-AC-07 / F-22: no images config ---------------------------------------------------------
test('PLAT-AC-07 next.config.js source has no images key (no domains, remotePatterns or formats)', () => {
  const src = stripComments(readText('next.config.js'));
  assert.doesNotMatch(src, /\bimages\s*:/);
  assert.doesNotMatch(src, /\bdomains\s*:/);
});

test('PLAT-AC-07 the evaluated next config has no images key and no webpack key when ANALYZE is unset', async () => {
  const saved = process.env.ANALYZE;
  delete process.env.ANALYZE;
  try {
    const req = createRequire(repoFile('next.config.js'));
    delete req.cache[repoFile('next.config.js')];
    let cfg = req(repoFile('next.config.js'));
    if (typeof cfg === 'function') cfg = await cfg('phase-production-build', { defaultConfig: {} });
    assert.equal(typeof cfg, 'object');
    assert.equal('images' in cfg, false, `images = ${JSON.stringify(cfg.images)}`);
    // A webpack key makes the default Turbopack build of Next 16 fail (SP-01, upgrade guide).
    assert.equal('webpack' in cfg, false, 'webpack key present without ANALYZE=true');
    // TERM-AC-04 redirect must survive the edit.
    const redirects = await cfg.redirects();
    assert.deepEqual(redirects.find((r) => r.source === '/v2'), { source: '/v2', destination: '/terminal', permanent: true });
  } finally {
    if (saved !== undefined) process.env.ANALYZE = saved;
  }
});

// ---- SP-01 finding 8: Next 16 rewrites tsconfig on first build; commit the rewrite --------------
test('U-02 SP-01 tsconfig.json already holds the Next 16 mandatory rewrite (jsx react-jsx, .next/dev/types included)', () => {
  const ts = readJsonc('tsconfig.json');
  assert.equal(ts.compilerOptions?.jsx, 'react-jsx');
  assert.ok((ts.include ?? []).includes('.next/dev/types/**/*.ts'), `include = ${JSON.stringify(ts.include)}`);
});

// ---- PLAT-AC-03 / TERM-AC-06: build with no env --------------------------------------------------
// Interface (developer writes it): node scripts/build-no-env.mjs [--cwd <dir>] [-- <cmd> <args...>]
//   default command: npm run build. The child env is process.env minus every NEXT_PUBLIC_* key and
//   every key containing SUPABASE. Exit 2 (no build) if Next would load env from a file in cwd:
//   .env, .env.local, .env.production, .env.production.local. Otherwise exit = child exit code.
//   Last line: `PASS PLAT-AC-03 TERM-AC-06 ...` or `FAIL PLAT-AC-03 TERM-AC-06 ... exit <n>`.
const LEAKY = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'x',
  SUPABASE_SERVICE_ROLE_KEY: 'y',
  NEXT_PUBLIC_SITE_URL: 'https://example.test',
};
const PROBE = "const k=Object.keys(process.env).filter(n=>/SUPABASE|^NEXT_PUBLIC_/i.test(n));console.log('LEAKED='+JSON.stringify(k));process.exit(Number(process.env.PROBE_EXIT||0))";

function runNoEnv(args, { cwd, env = {} } = {}) {
  const r = spawnSync(process.execPath, [repoFile('scripts/build-no-env.mjs'), ...args],
    { cwd: cwd ?? repoRoot, encoding: 'utf8', env: { ...process.env, ...LEAKY, ...env }, timeout: 60000 });
  return { status: r.status, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

test('PLAT-AC-03 TERM-AC-06 build-no-env strips every NEXT_PUBLIC_* and *SUPABASE* key before running the build command', () => {
  assert.ok(fs.existsSync(repoFile('scripts/build-no-env.mjs')), 'scripts/build-no-env.mjs does not exist yet');
  const dir = makeFixture({ 'package.json': '{}' });
  try {
    const r = runNoEnv(['--cwd', dir, '--', process.execPath, '-e', PROBE], { cwd: dir });
    assert.match(r.out, /LEAKED=\[\]/, r.out);
    assert.equal(r.status, 0, r.out);
    assert.match(r.out, /PASS PLAT-AC-03 TERM-AC-06/);
  } finally { removeFixture(dir); }
});

test('PLAT-AC-03 build-no-env propagates a failing build exit code and prints FAIL', () => {
  assert.ok(fs.existsSync(repoFile('scripts/build-no-env.mjs')), 'scripts/build-no-env.mjs does not exist yet');
  const dir = makeFixture({ 'package.json': '{}' });
  try {
    const r = runNoEnv(['--cwd', dir, '--', process.execPath, '-e', PROBE], { cwd: dir, env: { PROBE_EXIT: '3' } });
    assert.equal(r.status, 3, r.out);
    assert.match(r.out, /FAIL PLAT-AC-03 TERM-AC-06.*exit 3/);
  } finally { removeFixture(dir); }
});

for (const envFile of ['.env', '.env.local', '.env.production', '.env.production.local']) {
  test(`PLAT-AC-03 build-no-env refuses (exit 2, command not run) when ${envFile} exists, since Next would load env from it`, () => {
    assert.ok(fs.existsSync(repoFile('scripts/build-no-env.mjs')), 'scripts/build-no-env.mjs does not exist yet');
    const dir = makeFixture({ 'package.json': '{}', [envFile]: 'NEXT_PUBLIC_SUPABASE_URL=https://x.supabase.co\n' });
    try {
      const r = runNoEnv(['--cwd', dir, '--', process.execPath, '-e', PROBE], { cwd: dir });
      assert.equal(r.status, 2, r.out);
      assert.doesNotMatch(r.out, /LEAKED=/, 'the build command ran despite the env file');
      assert.match(r.out, new RegExp(envFile.replace(/\./g, '\\.')));
    } finally { removeFixture(dir); }
  });
}

test('PLAT-AC-03 build-no-env does not refuse on .env.example (a template, never loaded by Next)', () => {
  assert.ok(fs.existsSync(repoFile('scripts/build-no-env.mjs')), 'scripts/build-no-env.mjs does not exist yet');
  const dir = makeFixture({ 'package.json': '{}', '.env.example': 'NEXT_PUBLIC_SUPABASE_URL=\n' });
  try {
    const r = runNoEnv(['--cwd', dir, '--', process.execPath, '-e', PROBE], { cwd: dir });
    assert.equal(r.status, 0, r.out);
  } finally { removeFixture(dir); }
});

test('PLAT-AC-03 TERM-AC-06 gates.yml CG1_build is enforced and runs the build through scripts/build-no-env.mjs', () => {
  const g = gate('CG1_build');
  assert.equal(g.enforce, true);
  assert.match(g.cmd, /^node scripts\/build-no-env\.mjs(\s|$)/);
});

// ---- U-02 scope 5: every U-03-moved file the upgrade edits is a listed rename exception ---------
test('U-02 PLAT-AC-10 every U-03-moved file changed since the U-02 base is listed in scripts/rename-exceptions.json', () => {
  const ex = JSON.parse(readText('scripts/rename-exceptions.json'));
  const git = (args) => {
    const r = spawnSync('git', args, { cwd: repoRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    assert.equal(r.status, 0, `git ${args.join(' ')}: ${r.stderr}`);
    return r.stdout.split(/\r?\n/).filter(Boolean);
  };
  const moved = new Set(git(['diff', '-M90%', '--name-status', `${ex.moveCommit}^`, ex.moveCommit])
    .filter((l) => l.startsWith('R')).map((l) => l.split('\t')[2]));
  assert.ok(moved.size > 0, 'no renames found in the U-03 move commit');
  const changed = git(['diff', '--name-only', unitBase('U-02')]).filter((f) => moved.has(f));
  const listed = new Set((ex.exceptions ?? []).map((e) => e.path));
  assert.deepEqual(changed.filter((f) => !listed.has(f)), []);
});
