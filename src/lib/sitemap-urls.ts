import type { Post, WorkItem } from '@/content/types';

/**
 * SEO-AC-04, PROJ-AC-16: the URLs the sitemap lists. `/` and `/projects`, plus each published post or
 * case study whose URL is on this site; external URLs and unpublished posts are left out. `/play/` is
 * never listed (noindex). Each URL appears once, in order.
 */
export function sitemapUrls(siteUrl: string, posts: readonly Post[], work: readonly WorkItem[]): string[] {
  const onSite = (url?: string) => (url && url.startsWith(`${siteUrl}/`) ? [url] : []);
  // Planned items never reach the sitemap, even with a case study (U-09 review #5).
  const shown = work.filter((w) => w.status !== 'planned');
  const urls = [
    `${siteUrl}/`,
    `${siteUrl}/projects`,
    ...posts.filter((p) => p.status === 'published').flatMap((p) => onSite(p.url)),
    ...shown.flatMap((w) => [...onSite(w.caseStudyUrl), ...(w.caseStudy ? [`${siteUrl}/work/${w.slug}`] : [])]),
  ];
  return urls.filter((url, i) => urls.indexOf(url) === i);
}
