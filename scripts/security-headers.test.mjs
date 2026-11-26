// U-11 (ADR-P1, threat-model §6): the static two-tier header set in next.config.js.
// Baseline headers on every path, then the strict site CSP on the site routes. Next applies the later
// rule when two rules set the same key, so the order is asserted here and per route class in e2e.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readText, repoFile } from './lib/test-utils.mjs';

const loadConfig = (env = {}) => {
  const saved = { ...process.env };
  Object.assign(process.env, env);
  try {
    const req = createRequire(repoFile('next.config.js'));
    delete req.cache[repoFile('next.config.js')];
    const cfg = req(repoFile('next.config.js'));
    return typeof cfg === 'function' ? cfg('phase-production-build', { defaultConfig: {} }) : cfg;
  } finally {
    for (const k of Object.keys(process.env)) if (!(k in saved)) delete process.env[k];
    Object.assign(process.env, saved);
  }
};
const rules = async (env) => (await loadConfig(env).headers()) ?? [];
const valueOf = (rule, key) => rule.headers.find((h) => h.key.toLowerCase() === key.toLowerCase())?.value;
const directives = (csp) => Object.fromEntries(csp.split(';').map((d) => d.trim()).filter(Boolean)
  .map((d) => { const [name, ...vals] = d.split(/\s+/); return [name, vals]; }));
// Real request paths per route class (U-11 review #2): the rules are compiled with Next's own
// path-to-regexp and matched, instead of comparing source strings.
const SITE_PATHS = ['/', '/privacy', '/projects', '/work/sluice', '/writing/queues-double-charge', '/opengraph-image',
  '/opengraph-image-12o0cb', '/sitemap.xml', '/robots.txt'];
const BASELINE_PATHS = ['/terminal', '/api/analytics', '/does-not-exist', '/v2', '/privacy-old', '/opengraph-imagex'];
const BASELINE_CSP = "frame-ancestors 'none'; object-src 'none'; base-uri 'none'";
const { pathToRegexp } = createRequire(repoFile('package.json'))('next/dist/compiled/path-to-regexp');
// Next applies the later rule when two rules set the same key, so the effective CSP is the last match.
const effectiveCsp = (all, url) => all
  .filter((r) => pathToRegexp(r.source).test(url))
  .map((r) => valueOf(r, 'Content-Security-Policy'))
  .filter(Boolean)
  .at(-1);

test('PLAT-AC-20 PLAT-AC-21 poweredByHeader is false (no x-powered-by)', () => {
  assert.equal(loadConfig().poweredByHeader, false);
});

test('PLAT-AC-21 the first rule is the baseline for /:path* with the exact threat-model §6.1 values', async () => {
  const [base] = await rules();
  assert.equal(base.source, '/:path*');
  assert.equal(valueOf(base, 'Strict-Transport-Security'), 'max-age=63072000; includeSubDomains');
  assert.equal(valueOf(base, 'X-Content-Type-Options'), 'nosniff');
  assert.equal(valueOf(base, 'Referrer-Policy'), 'strict-origin-when-cross-origin');
  assert.equal(
    valueOf(base, 'Permissions-Policy'),
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  );
  assert.equal(valueOf(base, 'X-Frame-Options'), 'DENY');
  assert.equal(valueOf(base, 'Cross-Origin-Opener-Policy'), 'same-origin');
  const csp = directives(valueOf(base, 'Content-Security-Policy'));
  assert.deepEqual(csp['frame-ancestors'], ["'none'"]);
  assert.deepEqual(csp['object-src'], ["'none'"]);
  assert.deepEqual(csp['base-uri'], ["'none'"]);
  assert.equal(csp['script-src'], undefined, 'the baseline must not restrict scripts (RQ-11 a: /terminal unchanged)');
});

test('PLAT-AC-21 HSTS has no preload (SQ-03 a)', async () => {
  for (const r of await rules()) assert.doesNotMatch(valueOf(r, 'Strict-Transport-Security') ?? '', /preload/);
});

test('PLAT-AC-22 every header source compiles with Next path-to-regexp (an invalid source fails next build)', async () => {
  for (const r of await rules()) assert.doesNotThrow(() => pathToRegexp(r.source), r.source);
});

test('PLAT-AC-22 every site path resolves to the site CSP; terminal, API, 404 and look-alike paths keep the baseline CSP', async () => {
  const all = await rules({ NODE_ENV: 'production' });
  const site = valueOf(all.find((r) => r.source === '/'), 'Content-Security-Policy');
  assert.match(site, /form-action 'none'/);
  for (const url of SITE_PATHS) assert.equal(effectiveCsp(all, url), site, url);
  for (const url of BASELINE_PATHS) assert.equal(effectiveCsp(all, url), BASELINE_CSP, url);
});

test('PLAT-AC-22 the production site CSP: script-src self + unsafe-inline only, no host, no unsafe-eval, all lock-down directives', async () => {
  const site = (await rules({ NODE_ENV: 'production' })).find((r) => r.source === '/');
  const csp = directives(valueOf(site, 'Content-Security-Policy'));
  assert.deepEqual(csp['script-src'], ["'self'", "'unsafe-inline'"]);
  for (const d of ['object-src', 'base-uri', 'form-action', 'frame-ancestors', 'frame-src']) assert.deepEqual(csp[d], ["'none'"], d);
  assert.deepEqual(csp['default-src'], ["'self'"]);
  assert.deepEqual(csp['connect-src'], ["'self'"]);
  assert.deepEqual(csp['img-src'], ["'self'", 'data:']);
  assert.deepEqual(csp['font-src'], ["'self'"]);
});

test('PLAT-AC-22 unsafe-eval and the analytics debug host are added only in development', async () => {
  const prod = valueOf((await rules({ NODE_ENV: 'production' })).find((r) => r.source === '/'), 'Content-Security-Policy');
  const dev = valueOf((await rules({ NODE_ENV: 'development' })).find((r) => r.source === '/'), 'Content-Security-Policy');
  assert.doesNotMatch(prod, /unsafe-eval|va\.vercel-scripts\.com/);
  assert.match(directives(dev)['script-src'].join(' '), /'unsafe-eval'.*https:\/\/va\.vercel-scripts\.com/);
});

test('PLAT-AC-21 U-11 README documents the header set and the SEC-13 remediation timeframes', () => {
  const readme = readText('README.md');
  assert.match(readme, /## Security headers/);
  assert.match(readme, /critical[^\n]*7 days/i);
  assert.match(readme, /high[^\n]*30 days/i);
  assert.match(readme, /moderate[^\n]*next release/i);
});

// U-14: the projects platform in the config (src/lib/projects.ts builds the rules from src/content/work.ts).
const ZONE = 'https://sluice-example.vercel.app';

test('PROJ-AC-03 PROJ-AC-04 rewrites: none without SLUICE_ORIGIN; two beforeFiles rules with it', async () => {
  const off = await loadConfig({ SLUICE_ORIGIN: '' }).rewrites();
  assert.deepEqual(off.beforeFiles, []);
  const on = await loadConfig({ SLUICE_ORIGIN: ZONE }).rewrites();
  assert.deepEqual(on.beforeFiles, [
    { source: '/play/sluice', destination: `${ZONE}/play/sluice` },
    { source: '/play/sluice/:path*', destination: `${ZONE}/play/sluice/:path*` },
  ]);
  for (const r of on.beforeFiles) assert.ok(pathToRegexp(r.source), r.source);
});

test('PROJ-AC-02 a non-https SLUICE_ORIGIN fails the config (the build), naming the env var', async () => {
  await assert.rejects(async () => loadConfig({ SLUICE_ORIGIN: 'http://sluice-example.vercel.app' }).rewrites(), /SLUICE_ORIGIN/);
});

test('PROJ-AC-06 redirects: /work/promptshield is permanent to /work/sluice; /v2 is kept', async () => {
  const list = await loadConfig().redirects();
  assert.deepEqual(list.find((r) => r.source === '/work/promptshield'), { source: '/work/promptshield', destination: '/work/sluice', permanent: true });
  assert.ok(list.some((r) => r.source === '/v2'));
});

test('PROJ-AC-11 PROJ-AC-12 /play/sluice: noindex; zone CSP with wasm-unsafe-eval when deployed, site CSP when not', async () => {
  const deployed = await rules({ NODE_ENV: 'production', SLUICE_ORIGIN: ZONE });
  const local = await rules({ NODE_ENV: 'production', SLUICE_ORIGIN: '' });
  const robots = (all, url) => all.filter((r) => pathToRegexp(r.source).test(url)).map((r) => valueOf(r, 'X-Robots-Tag')).filter(Boolean).at(-1);
  for (const url of ['/play/sluice', '/play/sluice/assets/app.js']) {
    assert.equal(robots(deployed, url), 'noindex', url);
    assert.deepEqual(directives(effectiveCsp(deployed, url))['script-src'], ["'self'", "'wasm-unsafe-eval'"], url);
  }
  assert.equal(effectiveCsp(local, '/play/sluice'), effectiveCsp(local, '/'));
  for (const url of SITE_PATHS) assert.doesNotMatch(effectiveCsp(deployed, url), /wasm-unsafe-eval/, url);
  for (const url of BASELINE_PATHS) assert.equal(effectiveCsp(deployed, url), BASELINE_CSP, url);
});

test('PLAT-AC-26 productionBrowserSourceMaps is not enabled', () => {
  assert.notEqual(loadConfig().productionBrowserSourceMaps, true);
  assert.doesNotMatch(readText('next.config.js'), /productionBrowserSourceMaps:\s*true/);
});
