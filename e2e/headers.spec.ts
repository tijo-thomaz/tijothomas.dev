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

// Exact match (U-11 review #3): a leaked default-src or script-src would break the terminal.
const BASELINE_CSP = "frame-ancestors 'none'; object-src 'none'; base-uri 'none'";
for (const path of ['/terminal', '/api/analytics', '/does-not-exist']) {
  test(`PLAT-AC-21 ${path} keeps exactly the baseline CSP (RQ-11 a: the terminal stays unrestricted)`, async ({ request }) => {
    expect((await request.get(path)).headers()['content-security-policy']).toBe(BASELINE_CSP);
  });
}

test('PLAT-AC-21 Permissions-Policy is the exact threat-model value', async ({ request }) => {
  expect((await request.get('/')).headers()['permissions-policy']).toBe(
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  );
});

for (const path of ['/', '/privacy']) {
  test(`PLAT-AC-22 the CSP of ${path} has no script host, no unsafe-eval, and object-src/base-uri/form-action/frame-ancestors 'none'`, async ({ request }) => {
    const csp = directives((await request.get(path)).headers()['content-security-policy'] ?? '');
    expect(csp['script-src']).toEqual(["'self'", "'unsafe-inline'"]);
    for (const d of ['object-src', 'base-uri', 'form-action', 'frame-ancestors']) expect(csp[d], d).toEqual(["'none'"]);
  });
}

test('PLAT-AC-22 the placeholders, the OG image, sitemap and robots get the same site CSP as /', async ({ request }) => {
  const home = await request.get('/');
  const site = home.headers()['content-security-policy'];
  // The OG image is served at a hashed path; read it from the page's og:image tag.
  const og = new URL((await home.text()).match(/property="og:image" content="([^"]+)"/)?.[1] ?? '').pathname;
  expect(og).toMatch(/^\/opengraph-image/);
  for (const path of ['/projects', '/work/sluice', '/writing/queues-double-charge', og, '/sitemap.xml', '/robots.txt']) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(200);
    expect(res.headers()['content-security-policy'], path).toBe(site);
  }
});
