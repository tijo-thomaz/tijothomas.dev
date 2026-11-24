// Canonical origin of the site (F-69). metadataBase, canonical URLs and the sitemap build on it.
// The value lives in src/content/profile.ts, the single source of truth for site facts.
import { profile } from '@/content/profile';

export const siteUrl = profile.siteUrl;
