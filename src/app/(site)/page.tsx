import { Contact } from '@/components/Contact';
import { ExperienceTimeline } from '@/components/ExperienceTimeline';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { Highlights } from '@/components/Highlights';
import { HowIWork } from '@/components/HowIWork';
import { Nav } from '@/components/Nav';
import { SkipLink } from '@/components/SkipLink';
import { WorkSection } from '@/components/WorkSection';
import { Writing } from '@/components/Writing';
import { experience } from '@/content/experience';
import { posts } from '@/content/posts';
import { profile } from '@/content/profile';
import { work } from '@/content/work';
import { isShowPlanned } from '@/lib/flags';
import { JsonLd, personJsonLd } from '@/lib/json-ld';
import { siteUrl } from '@/lib/site';
import { visible } from '@/lib/visible';

import type { Metadata } from 'next';

const home = `${siteUrl}/`;
// The OG image comes from opengraph-image.tsx (file convention). It is named here too, so the
// metadata object is complete on its own (SEO-AC-01).
const ogImage = { url: '/opengraph-image', width: 1200, height: 630, alt: profile.headline };

// SEO-AC-01/11: all head tags for `/` come from profile.seo. No twitter.creator, no email or phone.
export const metadata: Metadata = {
  title: { absolute: profile.seo.title },
  description: profile.seo.description,
  alternates: { canonical: home },
  openGraph: {
    type: 'profile',
    url: home,
    siteName: profile.name,
    title: profile.seo.title,
    description: profile.seo.description,
    images: [ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: profile.seo.title,
    description: profile.seo.description,
    images: [ogImage],
  },
};

// `/`: a static server page composed from src/content. SHOW_PLANNED and the footer year are read at
// build time (the page is prerendered).
export default function HomePage() {
  const showPlanned = isShowPlanned(process.env.SHOW_PLANNED);
  const { labels, sections } = profile;
  return (
    <>
      <SkipLink label={labels.skipLink} />
      <Nav nav={profile.nav} />
      <main id="main" tabIndex={-1}>
        <Hero profile={profile} />
        <Highlights items={profile.highlights} label={labels.highlights} />
        <WorkSection items={visible(work, showPlanned)} section={sections.work} labels={labels} />
        <ExperienceTimeline entries={experience} section={sections.experience} labels={labels} />
        <HowIWork steps={profile.howIWork} title={sections.howIWork.title} />
        <Writing posts={visible(posts, showPlanned)} section={sections.writing} labels={labels} />
        <Contact profile={profile} />
      </main>
      <Footer name={profile.name} year={new Date().getFullYear()} terminalLabel={labels.terminalMode} />
      <JsonLd data={personJsonLd(profile)} />
    </>
  );
}
