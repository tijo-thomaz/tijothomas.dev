import { notFound } from 'next/navigation';

import { Placeholder } from '@/components/Placeholder';
import { profile } from '@/content/profile';
import { placeholderWorkSlug, work } from '@/content/work';
import { workBadge } from '@/lib/format';
import { siteUrl } from '@/lib/site';

import type { Metadata } from 'next';

type Params = { params: Promise<{ slug: string }> };

// SEO-AC-07: one prerendered placeholder; any other slug is a 404 (closed param set).
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ slug: placeholderWorkSlug }];
}

const itemFor = (slug: string) => (slug === placeholderWorkSlug ? work.find((w) => w.slug === slug) : undefined);

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const item = itemFor(slug);
  if (!item) return {};
  return {
    title: item.name,
    description: item.subtitle,
    robots: { index: false, follow: true },
    alternates: { canonical: `${siteUrl}/work/${slug}` },
  };
}

export default async function WorkPlaceholderPage({ params }: Params) {
  const { slug } = await params;
  const item = itemFor(slug);
  if (!item) notFound();
  return (
    <Placeholder
      title={item.name}
      subtitle={item.subtitle}
      badge={{ text: workBadge(item, profile.labels.workStatus), tone: item.status }}
      profile={profile}
    />
  );
}
