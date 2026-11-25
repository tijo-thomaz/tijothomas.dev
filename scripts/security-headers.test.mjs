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
const SITE_SOURCES = ['/', '/privacy', '/work/:path*', '/writing/:path*', '/sitemap.xml', '/robots.txt'];

test('PLAT-AC-20 PLAT-AC-21 poweredByHeader is false (no x-powered-by)', () => {
  assert.equal(loadConfig().poweredByHeader, false);
});

test('PLAT-AC-21 the first rule is the baseline for /:path* with the exact threat-model §6.1 values', async () => {
  const [base] = await rules();
  assert.equal(base.source, '/:path*');
  assert.equal(valueOf(base, 'Strict-Transport-Security'), 'max-age=63072000; includeSubDomains');
  assert.equal(valueOf(base, 'X-Content-Type-Options'), 'nosniff');
  assert.equal(valueOf(base, 'Referrer-Policy'), 'strict-origin-when-cross-origin');
  assert.match(valueOf(base, 'Permissions-Policy'), /camera=\(\).*microphone=\(\).*geolocation=\(\)/);
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

test('PLAT-AC-22 every site route has a site-CSP rule after the baseline rule', async () => {
  const all = await rules();
  for (const src of SITE_SOURCES) {
    const i = all.findIndex((r) => r.source === src && valueOf(r, 'Content-Security-Policy'));
    assert.ok(i > 0, `${src}: no site-CSP rule after the baseline`);
  }
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

test('PLAT-AC-26 productionBrowserSourceMaps is not enabled', () => {
  assert.notEqual(loadConfig().productionBrowserSourceMaps, true);
  assert.doesNotMatch(readText('next.config.js'), /productionBrowserSourceMaps:\s*true/);
});
