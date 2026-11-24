import type { MetadataRoute } from 'next';

import { posts } from '@/content/posts';
import { work } from '@/content/work';
import { siteUrl } from '@/lib/site';

// SEO-AC-04: built from content. `/` plus any published post or case study hosted on this site.
// /terminal, /v2 and the noindex placeholder pages are never listed. No lastModified: there is no
// confirmed date to give.
export default function sitemap(): MetadataRoute.Sitemap {
  const onSite = (url?: string) => (url && url.startsWith(`${siteUrl}/`) ? [url] : []);
  const urls = [
    `${siteUrl}/`,
    ...posts.filter((p) => p.status === 'published').flatMap((p) => onSite(p.url)),
    ...work.flatMap((w) => onSite(w.caseStudyUrl)),
  ];
  return urls.filter((url, i) => urls.indexOf(url) === i).map((url) => ({ url }));
}
