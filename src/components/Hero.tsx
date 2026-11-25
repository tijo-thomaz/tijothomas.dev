import type { Profile } from '@/content/types';

import { CityMap } from './CityMap/CityMap';

type HeroProfile = Pick<Profile, 'location' | 'relocation' | 'headline' | 'hero' | 'city' | 'nav'>;

// HOME-AC-01: the page's only h1, with the CityMap in the right column (U-08).
export function Hero({ profile }: { profile: HeroProfile }) {
  const { location, relocation, headline, hero } = profile;
  const line = [location, relocation.summary, relocation.visaSponsorshipRequired ? relocation.visaLabel : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <section id="top" className="hero band band--mint">
      <div className="hero-inner wrap">
        <div className="hero-copy">
          <p className="hero-line">{line}</p>
          <h1 className="hero-title">{headline}</h1>
          <p className="hero-intro">{hero.intro}</p>
          <div className="cta-row">
            <a href={hero.primaryCta.href} className="btn btn--accent">
              {hero.primaryCta.label}
            </a>
            <a href={hero.secondaryCta.href} className="btn btn--outline">
              {hero.secondaryCta.label}
            </a>
          </div>
          <p className="hero-tip">{hero.tip}</p>
        </div>
        <div className="hero-map">
          <CityMap city={profile.city} nav={profile.nav} />
        </div>
      </div>
    </section>
  );
}
