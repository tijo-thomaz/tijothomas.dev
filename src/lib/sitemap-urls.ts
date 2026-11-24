import type { Post, WorkItem } from '@/content/types';

/**
 * SEO-AC-04: the URLs the sitemap lists. `/`, plus each published post or case study whose URL is
 * on this site; external URLs and unpublished posts are left out. Each URL appears once, in order.
 */
export function sitemapUrls(siteUrl: string, posts: readonly Post[], work: readonly WorkItem[]): string[] {
  const onSite = (url?: string) => (url && url.startsWith(`${siteUrl}/`) ? [url] : []);
  const urls = [
    `${siteUrl}/`,
    ...posts.filter((p) => p.status === 'published').flatMap((p) => onSite(p.url)),
    // Planned items never reach the sitemap, even with a case-study URL (U-09 review #5).
    ...work.filter((w) => w.status !== 'planned').flatMap((w) => onSite(w.caseStudyUrl)),
  ];
  return urls.filter((url, i) => urls.indexOf(url) === i);
}
