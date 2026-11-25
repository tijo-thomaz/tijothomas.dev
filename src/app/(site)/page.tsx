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
// The OG and Twitter image tags come from opengraph-image.tsx (file convention). Next serves it at a
// hashed path (/opengraph-image-<hash>), so it must not be named here: an explicit url overrode the
// generated tag and pointed at a 404 (U-09 gate run).

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
  },
  twitter: {
    card: 'summary_large_image',
    title: profile.seo.title,
    description: profile.seo.description,
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
      <Footer
        name={profile.name}
        year={new Date().getFullYear()}
        terminalLabel={labels.terminalMode}
        privacyLabel={labels.privacy}
      />
      <JsonLd data={personJsonLd(profile)} />
    </>
  );
}
