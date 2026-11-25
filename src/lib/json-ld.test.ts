// U-09: JSON-LD built only from src/content and serialised by one escaping helper (SEC-09).
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { posts } from '@/content/posts';
import { profile } from '@/content/profile';

import { JsonLd, personJsonLd, serializeJsonLd, techArticleJsonLd } from './json-ld';

const strings = (v: unknown): string[] =>
  typeof v === 'string' ? [v] : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : [];
const keys = (v: unknown): string[] =>
  v && typeof v === 'object' ? Object.entries(v).flatMap(([k, x]) => [k, ...keys(x)]) : [];

describe('serializeJsonLd', () => {
  it('SEO-AC-06 escapes every < so data cannot close the script element', () => {
    const out = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('<');
    expect(out).toContain('\\u003c/script>');
    expect(JSON.parse(out)).toEqual({ name: '</script><script>alert(1)</script>' });
  });

  it('SEO-AC-06 JsonLd renders one application/ld+json script with the escaped data', () => {
    const html = renderToStaticMarkup(JsonLd({ data: { a: '<b>' } }));
    expect(html).toBe('<script type="application/ld+json">{"a":"\\u003cb>"}</script>');
  });
});

describe('personJsonLd', () => {
  const person = personJsonLd(profile);

  it('SEO-AC-06 is a schema.org Person with name, jobTitle, url and knowsAbout from profile.ts', () => {
    expect(person).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: profile.name,
      jobTitle: profile.jobTitle,
      url: `${profile.siteUrl}/`,
      knowsAbout: [...profile.knowsAbout],
    });
  });

  it('SEO-AC-06 sameAs lists only the confirmed, non-empty LinkedIn and GitHub URLs', () => {
    expect(person.sameAs).toEqual([profile.links.linkedin, profile.links.github]);
  });

  it('SEO-AC-11 has no email, telephone or contactPoint, and no string value contains @', () => {
    expect(keys(person).filter((k) => /email|telephone|contactPoint/i.test(k))).toEqual([]);
    expect(strings(person).filter((s) => s.includes('@'))).toEqual([]);
  });
});

describe('techArticleJsonLd', () => {
  it('SEO-AC-08 is a TechArticle with headline and a Person author', () => {
    const post = posts[0];
    const article = techArticleJsonLd(post, profile, `${profile.siteUrl}/writing/${post.slug}`);
    expect(article).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: post.title,
      description: post.subtitle,
      url: `${profile.siteUrl}/writing/${post.slug}`,
      author: { '@type': 'Person', name: profile.name, url: `${profile.siteUrl}/` },
    });
    expect(keys(article)).not.toContain('datePublished'); // no invented dates
    expect(strings(article).filter((s) => s.includes('@'))).toEqual([]);
  });
});
