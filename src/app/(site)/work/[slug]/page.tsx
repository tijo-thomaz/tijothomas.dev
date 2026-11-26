import { notFound } from 'next/navigation';

import { CaseStudy } from '@/components/CaseStudy';
import { profile } from '@/content/profile';
import { work } from '@/content/work';
import { caseStudyFor, caseStudyItems } from '@/lib/case-studies';
import { isShowPlanned } from '@/lib/flags';
import { playLinks } from '@/lib/projects';
import { siteUrl } from '@/lib/site';

import type { Metadata } from 'next';

type Params = { params: Promise<{ slug: string }> };

// SEO-AC-07, PROJ-AC-08: one prerendered page per visible item with a case study; any other slug is a
// 404 (closed param set). SHOW_PLANNED and the demo origins are read at build time.
export const dynamicParams = false;

const pageFor = (slug: string) => {
  const item = caseStudyItems(work, isShowPlanned(process.env.SHOW_PLANNED)).find((w) => w.slug === slug);
  const study = item ? caseStudyFor(slug) : undefined;
  return item && study ? { item, study } : undefined;
};

export function generateStaticParams() {
  return caseStudyItems(work, isShowPlanned(process.env.SHOW_PLANNED)).map((w) => ({ slug: w.slug }));
}

// PROJ-AC-16: indexable, with its own title, description and canonical.
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const page = pageFor(slug);
  if (!page) return {};
  const url = `${siteUrl}/work/${slug}`;
  return {
    title: page.item.name,
    description: page.study.description,
    alternates: { canonical: url },
    openGraph: { type: 'article', url, title: page.item.name, description: page.study.description },
  };
}

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params;
  const page = pageFor(slug);
  if (!page) notFound();
  return (
    <CaseStudy item={page.item} study={page.study} profile={profile} playHref={playLinks(work, process.env)[slug]} />
  );
}
