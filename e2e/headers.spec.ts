// U-11: security headers per route class on a production build (`next start`). Ordering mistakes in
// next.config headers() fail silently, so each class is read from a real response.
import { expect, test, type APIResponse } from '@playwright/test';

const directives = (csp: string) =>
  Object.fromEntries(
    csp
      .split(';')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((d) => {
        const [name, ...vals] = d.split(/\s+/);
        return [name, vals] as const;
      }),
  );

function expectBaseline(res: APIResponse, path: string) {
  const h = res.headers();
  expect(h['strict-transport-security'], path).toBe('max-age=63072000; includeSubDomains');
  expect(h['x-content-type-options'], path).toBe('nosniff');
  expect(h['referrer-policy'], path).toBe('strict-origin-when-cross-origin');
  expect(h['permissions-policy'], path).toMatch(/camera=\(\)/);
  expect(h['x-frame-options'], path).toBe('DENY');
  expect(h['cross-origin-opener-policy'], path).toBe('same-origin');
  expect(h['content-security-policy'], path).toMatch(/frame-ancestors 'none'/);
  expect(h['x-powered-by'], path).toBeUndefined();
}

test('PLAT-AC-20 GET / has HSTS, nosniff, referrer-policy, permissions-policy, frame-ancestors and no x-powered-by', async ({ request }) => {
  const res = await request.get('/');
  expect(res.status()).toBe(200);
  expectBaseline(res, '/');
});

for (const path of ['/terminal', '/api/analytics', '/does-not-exist']) {
  test(`PLAT-AC-21 ${path} carries the full baseline header set and no x-powered-by`, async ({ request }) => {
    const res = await request.get(path);
    expectBaseline(res, path);
  });
}

test('PLAT-AC-21 /terminal keeps the baseline CSP only (scripts and connections unrestricted, RQ-11 a)', async ({ request }) => {
  const csp = directives((await request.get('/terminal')).headers()['content-security-policy'] ?? '');
  expect(csp['script-src']).toBeUndefined();
  expect(csp['connect-src']).toBeUndefined();
});

for (const path of ['/', '/privacy']) {
  test(`PLAT-AC-22 the CSP of ${path} has no script host, no unsafe-eval, and object-src/base-uri/form-action/frame-ancestors 'none'`, async ({ request }) => {
    const csp = directives((await request.get(path)).headers()['content-security-policy'] ?? '');
    expect(csp['script-src']).toEqual(["'self'", "'unsafe-inline'"]);
    for (const d of ['object-src', 'base-uri', 'form-action', 'frame-ancestors']) expect(csp[d], d).toEqual(["'none'"]);
  });
}

test('PLAT-AC-22 the placeholder, sitemap and robots routes get the site CSP too', async ({ request }) => {
  for (const path of ['/work/promptshield', '/sitemap.xml', '/robots.txt']) {
    const csp = (await request.get(path)).headers()['content-security-policy'] ?? '';
    expect(csp, path).toMatch(/form-action 'none'/);
  }
});
