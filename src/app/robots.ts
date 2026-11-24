import type { MetadataRoute } from 'next';

import { siteUrl } from '@/lib/site';

// SEO-AC-05: every crawler may fetch everything. Pages that must not be indexed say so themselves
// (the /terminal and placeholder routes use robots noindex metadata).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
