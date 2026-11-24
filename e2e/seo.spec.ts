// U-09: SEO routes against the production build (SEO-AC-02, SEO-AC-07; sitemap and robots served).
import { expect, test } from '@playwright/test';

test('SEO-AC-02 GET /opengraph-image is a 1200x630 PNG', async ({ request }) => {
  const res = await request.get('/opengraph-image');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('image/png');
  const png = await res.body();
  // PNG signature, then the IHDR chunk: width and height are big-endian at bytes 16-23.
  expect(png.subarray(1, 4).toString('ascii')).toBe('PNG');
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
});

test('SEO-AC-01 / has a canonical, a description and an og:image tag in the head', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/$/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{70,160}/);
  await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute('content', /opengraph-image/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
});

for (const path of ['/work/promptshield', '/writing/queues-double-charge']) {
  test(`SEO-AC-07 ${path} answers 200 with robots noindex`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });
}

for (const path of ['/work/does-not-exist', '/writing/does-not-exist', '/work/fde-mcp-gateway']) {
  test(`SEO-AC-07 ${path} answers 404`, async ({ request }) => {
    expect((await request.get(path)).status()).toBe(404);
  });
}

test('SEO-AC-04 SEO-AC-05 /sitemap.xml lists / and /robots.txt points to it', async ({ request, baseURL }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('<loc>https://tijothomas.dev/</loc>');
  expect(sitemap).not.toMatch(/terminal|\/work\/|\/writing\//);
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toMatch(/User-Agent: \*/i);
  expect(robots).toContain('Sitemap: https://tijothomas.dev/sitemap.xml');
  expect(baseURL).toBeTruthy();
});
