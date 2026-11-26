// U-09: SEO routes against the production build (SEO-AC-02, SEO-AC-07; sitemap and robots served).
import { expect, test } from '@playwright/test';

test('SEO-AC-02 the og:image and twitter:image of / resolve to a 1200x630 PNG', async ({ page, request }) => {
  await page.goto('/');
  // Next serves the file-convention image at a hashed path; follow the tags, do not guess the URL.
  const og = await page.locator('meta[property="og:image"]').first().getAttribute('content');
  const tw = await page.locator('meta[name="twitter:image"]').first().getAttribute('content');
  expect(og).toMatch(/\/opengraph-image/);
  expect(tw).toBe(og);
  const res = await request.get(new URL(og ?? '').pathname + new URL(og ?? '').search);
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('image/png');
  const png = await res.body();
  // PNG signature, then the IHDR chunk: width and height are big-endian at bytes 16-23.
  expect(png.subarray(1, 4).toString('ascii')).toBe('PNG');
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
});

test('SEO-AC-01 / has a canonical, a description and an og:image tag in the head', async ({ page }) => {
  await page.goto('/');
  // Next normalises the root canonical "<siteUrl>/" to "<siteUrl>" (same URL).
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/tijothomas\.dev\/?$/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{70,160}/);
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
});

test('SEO-AC-07 /writing/queues-double-charge answers 200 with robots noindex', async ({ page }) => {
  const res = await page.goto('/writing/queues-double-charge');
  expect(res?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

for (const [path, title] of [['/projects', 'Projects'], ['/work/sluice', 'Sluice']]) {
  test(`SEO-AC-07 PROJ-AC-16 ${path} answers 200, indexable, with its own title, description and canonical`, async ({ page }) => {
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    expect(res?.headers()['x-robots-tag']).toBeUndefined();
    await expect(page).toHaveTitle(`${title} · Tijo Thomas`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\S/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://tijothomas.dev${path}`);
  });
}

for (const path of ['/work/does-not-exist', '/writing/does-not-exist', '/work/fde-mcp-gateway']) {
  test(`SEO-AC-07 ${path} answers 404`, async ({ request }) => {
    expect((await request.get(path)).status()).toBe(404);
  });
}

test('SEO-AC-04 SEO-AC-05 /sitemap.xml lists / and /robots.txt points to it', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('<loc>https://tijothomas.dev/</loc>');
  expect(sitemap).not.toMatch(/terminal|\/play\/|\/writing\//);
  // PROJ-AC-16: the projects index and the case study are listed.
  expect(sitemap).toContain('<loc>https://tijothomas.dev/projects</loc>');
  expect(sitemap).toContain('<loc>https://tijothomas.dev/work/sluice</loc>');
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toMatch(/User-Agent: \*/i);
  expect(robots).toContain('Sitemap: https://tijothomas.dev/sitemap.xml');
});
