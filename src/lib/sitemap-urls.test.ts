// U-09 SEO-AC-04: which content URLs reach the sitemap.
import { describe, expect, it } from 'vitest';

import type { Post, WorkItem } from '@/content/types';

import { sitemapUrls } from './sitemap-urls';

const SITE = 'https://example.dev';
const post = (over: Partial<Post>): Post => ({ slug: 's', title: 'T', subtitle: 'S', status: 'published', ...over });
const item = (over: Partial<WorkItem>): WorkItem => ({
  slug: 'w', name: 'N', subtitle: 'S', status: 'live', summary: 'x', metric: null, stack: [], ...over,
});

describe('sitemapUrls', () => {
  it('SEO-AC-04 always lists <siteUrl>/ first', () => {
    expect(sitemapUrls(SITE, [], [])).toEqual([`${SITE}/`]);
  });

  it('SEO-AC-04 lists published posts and case studies hosted on the site', () => {
    const urls = sitemapUrls(SITE, [post({ url: `${SITE}/writing/a` })], [item({ caseStudyUrl: `${SITE}/work/b` })]);
    expect(urls).toEqual([`${SITE}/`, `${SITE}/writing/a`, `${SITE}/work/b`]);
  });

  it('SEO-AC-04 leaves out unpublished posts, missing URLs and URLs on other origins', () => {
    const urls = sitemapUrls(
      SITE,
      [post({ status: 'coming-soon', url: `${SITE}/writing/c` }), post({ url: undefined }), post({ url: 'https://medium.com/x' })],
      [item({ caseStudyUrl: 'https://github.com/x' }), item({})],
    );
    expect(urls).toEqual([`${SITE}/`]);
  });

  it('SEO-AC-04 lists each URL once', () => {
    const urls = sitemapUrls(SITE, [post({ url: `${SITE}/a` }), post({ url: `${SITE}/a` })], []);
    expect(urls).toEqual([`${SITE}/`, `${SITE}/a`]);
  });
});
