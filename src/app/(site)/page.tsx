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
import { visible } from '@/lib/visible';

// `/`: a static server page composed from src/content. SHOW_PLANNED and the footer year are read at
// build time (the page is prerendered). The CityMap arrives in U-08.
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
    </>
  );
}
