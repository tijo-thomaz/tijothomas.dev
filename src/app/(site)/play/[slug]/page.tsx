import { notFound } from 'next/navigation';

import { PlayFallback } from '@/components/PlayFallback';
import { profile } from '@/content/profile';
import { work } from '@/content/work';
import { playableItems } from '@/lib/projects';
import { siteUrl } from '@/lib/site';

import type { Metadata } from 'next';

type Params = { params: Promise<{ slug: string }> };

// PROJ-AC-05: one prerendered page per project with a demo env name. When the env var is set, a
// beforeFiles rewrite (next.config.js) serves the project's own deployment instead of this page.
export const dynamicParams = false;

export function generateStaticParams() {
  return playableItems(work).map((w) => ({ slug: w.slug }));
}

const itemFor = (slug: string) => playableItems(work).find((w) => w.slug === slug);

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const item = itemFor(slug);
  if (!item) return {};
  return {
    title: item.name,
    description: item.subtitle,
    robots: { index: false, follow: true },
    alternates: { canonical: `${siteUrl}/play/${slug}` },
  };
}

export default async function PlayPage({ params }: Params) {
  const { slug } = await params;
  const item = itemFor(slug);
  if (!item) notFound();
  return <PlayFallback item={item} profile={profile} />;
}
