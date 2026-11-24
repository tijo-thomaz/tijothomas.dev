// U-09 SEO-AC-04 and SEO-AC-05: sitemap and robots are data-driven from content and siteUrl.
import { describe, expect, it } from 'vitest';

import { siteUrl } from '@/lib/site';

import robots from './robots';
import sitemap from './sitemap';

describe('sitemap', () => {
  const urls = sitemap().map((e) => e.url);

  it('SEO-AC-04 contains the home page at <siteUrl>/', () => {
    expect(urls).toContain(`${siteUrl}/`);
  });

  it('SEO-AC-04 excludes /terminal, /v2 and the noindex placeholder pages', () => {
    expect(urls.filter((u) => /\/terminal|\/v2|\/work\/|\/writing\//.test(u))).toEqual([]);
  });

  it('SEO-AC-04 lists only absolute https URLs on the site origin, once each', () => {
    expect(urls.filter((u) => !u.startsWith(`${siteUrl}/`))).toEqual([]);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('SEO-AC-04 invents no dates (no lastModified without a source)', () => {
    expect(sitemap().filter((e) => e.lastModified !== undefined)).toEqual([]);
  });
});

describe('robots', () => {
  it('SEO-AC-05 allows every user agent and points to <siteUrl>/sitemap.xml', () => {
    const r = robots();
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    expect(rules).toEqual([{ userAgent: '*', allow: '/' }]);
    expect(r.sitemap).toBe(`${siteUrl}/sitemap.xml`);
  });
});
