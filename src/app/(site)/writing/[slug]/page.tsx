import { notFound } from 'next/navigation';

import { Placeholder } from '@/components/Placeholder';
import { placeholderPostSlug, posts } from '@/content/posts';
import { profile } from '@/content/profile';
import { JsonLd, techArticleJsonLd } from '@/lib/json-ld';
import { siteUrl } from '@/lib/site';

import type { Metadata } from 'next';

type Params = { params: Promise<{ slug: string }> };

// SEO-AC-07: one prerendered placeholder; any other slug is a 404 (closed param set).
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ slug: placeholderPostSlug }];
}

const postFor = (slug: string) => (slug === placeholderPostSlug ? posts.find((p) => p.slug === slug) : undefined);

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = postFor(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.subtitle,
    robots: { index: false, follow: true },
    alternates: { canonical: `${siteUrl}/writing/${slug}` },
  };
}

export default async function WritingPlaceholderPage({ params }: Params) {
  const { slug } = await params;
  const post = postFor(slug);
  if (!post) notFound();
  const badge = post.status === 'published' ? undefined : { text: profile.labels.postStatus[post.status], tone: post.status };
  return (
    <>
      <Placeholder title={post.title} subtitle={post.subtitle} badge={badge} profile={profile} />
      {/* SEO-AC-08 */}
      <JsonLd data={techArticleJsonLd(post, profile, `${siteUrl}/writing/${slug}`)} />
    </>
  );
}
