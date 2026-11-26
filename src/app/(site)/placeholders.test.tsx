// U-09: the /writing/[slug] placeholder page (SEO-AC-07 unit half, SEO-AC-08). Since U-15,
// /work/[slug] serves case studies only (work/case-study.test.tsx).
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { placeholderPostSlug, posts } from '@/content/posts';
import { profile } from '@/content/profile';
import { siteUrl } from '@/lib/site';

import * as writingPage from './writing/[slug]/page';

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

describe.each([
  ['writing', writingPage, placeholderPostSlug, posts.find((p) => p.slug === placeholderPostSlug)?.title],
] as const)('/%s/[slug]', (route, mod, slug, title) => {
  it(`SEO-AC-07 /${route} pre-renders only the placeholder slug from content, and unknown slugs 404 (dynamicParams = false)`, async () => {
    expect(await mod.generateStaticParams()).toEqual([{ slug }]);
    expect(mod.dynamicParams).toBe(false);
  });

  it(`SEO-AC-07 /${route}/<placeholder> is noindex (follow) with a canonical on its own URL`, async () => {
    const meta = await mod.generateMetadata(params(slug));
    expect(meta.robots).toEqual({ index: false, follow: true });
    expect(meta.title).toBe(title);
    expect(meta.alternates?.canonical).toBe(`${siteUrl}/${route}/${slug}`);
  });

  it(`SEO-AC-07 /${route} with an unknown or planned slug has no metadata and renders notFound (404)`, async () => {
    for (const bad of ['does-not-exist', 'fde-mcp-gateway']) {
      expect(await mod.generateMetadata(params(bad))).toEqual({});
      await expect(mod.default(params(bad))).rejects.toThrow(/NEXT_HTTP_ERROR_FALLBACK;404|NEXT_NOT_FOUND|not.?found/i);
    }
  });

  it(`SEO-AC-07 /${route}/<placeholder> renders one h1 from content and a link home`, async () => {
    const html = renderToStaticMarkup(await mod.default(params(slug)));
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain(`>${title}</h1>`);
    expect(html).toContain('href="/"');
    expect(html).toContain(profile.nav.brand);
  });
});

describe('/writing/[slug] JSON-LD', () => {
  it('SEO-AC-08 the placeholder post page has a TechArticle with headline and a Person author', async () => {
    const html = renderToStaticMarkup(await writingPage.default(params(placeholderPostSlug)));
    const block = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? '{}';
    const data = JSON.parse(block);
    expect(data['@type']).toBe('TechArticle');
    expect(data.headline).toBe(posts.find((p) => p.slug === placeholderPostSlug)?.title);
    expect(data.author['@type']).toBe('Person');
  });
});

describe('placeholder slugs in content', () => {
  it('SEO-AC-07 the placeholder post is not planned (no planned item gets a page while SHOW_PLANNED is off)', () => {
    expect(posts.find((p) => p.slug === placeholderPostSlug)?.status).not.toBe('planned');
  });
});
