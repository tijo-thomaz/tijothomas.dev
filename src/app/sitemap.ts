import type { MetadataRoute } from 'next';

import { posts } from '@/content/posts';
import { work } from '@/content/work';
import { siteUrl } from '@/lib/site';
import { sitemapUrls } from '@/lib/sitemap-urls';

// SEO-AC-04, PROJ-AC-16: built from content. /projects and the case studies are listed; /terminal, /v2,
// /play and the noindex placeholder pages never are.
// No lastModified: there is no confirmed date to give.
export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapUrls(siteUrl, posts, work).map((url) => ({ url }));
}
