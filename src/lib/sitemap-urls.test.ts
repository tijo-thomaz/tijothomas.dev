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
  it('SEO-AC-04 PROJ-AC-16 always lists <siteUrl>/ first, then <siteUrl>/projects', () => {
    expect(sitemapUrls(SITE, [], [])).toEqual([`${SITE}/`, `${SITE}/projects`]);
  });

  it('SEO-AC-04 lists published posts and case studies hosted on the site', () => {
    const urls = sitemapUrls(SITE, [post({ url: `${SITE}/writing/a` })], [item({ caseStudyUrl: `${SITE}/work/b` })]);
    expect(urls).toEqual([`${SITE}/`, `${SITE}/projects`, `${SITE}/writing/a`, `${SITE}/work/b`]);
  });

  it('PROJ-AC-16 lists /work/<slug> for each non-planned item with caseStudy: true, and never a /play/ URL', () => {
    const urls = sitemapUrls(SITE, [], [
      item({ slug: 'a', caseStudy: true, playOriginEnv: 'A_ORIGIN' }),
      item({ slug: 'b' }),
      item({ slug: 'c', caseStudy: true, status: 'planned' }),
    ]);
    expect(urls).toEqual([`${SITE}/`, `${SITE}/projects`, `${SITE}/work/a`]);
  });

  it('SEO-AC-04 leaves out unpublished posts, missing URLs and URLs on other origins', () => {
    const urls = sitemapUrls(
      SITE,
      [post({ status: 'coming-soon', url: `${SITE}/writing/c` }), post({ url: undefined }), post({ url: 'https://medium.com/x' })],
      [item({ caseStudyUrl: 'https://external.example/case' }), item({})],
    );
    expect(urls).toEqual([`${SITE}/`, `${SITE}/projects`]);
  });

  it('SEO-AC-04 CONT-AC-03 never lists a planned work item, even with an on-site case study', () => {
    const urls = sitemapUrls(SITE, [], [item({ status: 'planned', caseStudyUrl: `${SITE}/work/p` })]);
    expect(urls).toEqual([`${SITE}/`, `${SITE}/projects`]);
  });

  it('SEO-AC-04 lists each URL once', () => {
    const urls = sitemapUrls(SITE, [post({ url: `${SITE}/a` }), post({ url: `${SITE}/a` })], [
      item({ slug: 'b', caseStudy: true, caseStudyUrl: `${SITE}/work/b` }),
    ]);
    expect(urls).toEqual([`${SITE}/`, `${SITE}/projects`, `${SITE}/a`, `${SITE}/work/b`]);
  });
});
