import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { Highlights } from '@/components/Highlights';
import { Nav } from '@/components/Nav';
import { SkipLink } from '@/components/SkipLink';
import { profile } from '@/content/profile';

// `/`: a static server page composed from src/content (U-06 shell). Work, Experience, How I work and
// Writing sections arrive in U-07; the CityMap in U-08. The year is fixed at build time.
export default function HomePage() {
  return (
    <>
      <SkipLink label={profile.labels.skipLink} />
      <Nav nav={profile.nav} />
      <main id="main" tabIndex={-1}>
        <Hero profile={profile} />
        <Highlights items={profile.highlights} label={profile.labels.highlights} />
        <Contact profile={profile} />
      </main>
      <Footer name={profile.name} year={new Date().getFullYear()} terminalLabel={profile.labels.terminalMode} />
    </>
  );
}
