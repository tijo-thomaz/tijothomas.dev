import { createElement } from 'react';

import type { Post, Profile } from '@/content/types';

// The site's only raw-HTML sink (SEC-09, SEC-10, PLAT-AC-23). JSON-LD is a data block, not executed,
// but a "</script>" inside the data would end the element early. Every "<" is therefore escaped as
// <, which JSON parsers read back as "<". Data comes only from src/content.

export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: serializeJsonLd(data) },
  });
}

/** SEO-AC-06/11: the owner as a schema.org Person. No email, telephone or contactPoint (ADR-P5). */
export function personJsonLd(profile: Profile) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.jobTitle,
    url: `${profile.siteUrl}/`,
    sameAs: [profile.links.linkedin, profile.links.github].filter(Boolean),
    knowsAbout: [...profile.knowsAbout],
  };
}

/** SEO-AC-08: a post as a TechArticle. No dates: none are confirmed in content. */
export function techArticleJsonLd(post: Post, profile: Profile, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: post.title,
    description: post.subtitle,
    url,
    author: { '@type': 'Person', name: profile.name, url: `${profile.siteUrl}/` },
  };
}
