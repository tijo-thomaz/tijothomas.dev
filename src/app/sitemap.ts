import type { MetadataRoute } from 'next';

import { posts } from '@/content/posts';
import { work } from '@/content/work';
import { siteUrl } from '@/lib/site';
import { sitemapUrls } from '@/lib/sitemap-urls';

// SEO-AC-04: built from content. /terminal, /v2 and the noindex placeholder pages are never listed.
// No lastModified: there is no confirmed date to give.
export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapUrls(siteUrl, posts, work).map((url) => ({ url }));
}
