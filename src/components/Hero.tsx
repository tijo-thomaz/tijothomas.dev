import type { Profile } from '@/content/types';

type HeroProfile = Pick<Profile, 'location' | 'relocation' | 'headline' | 'hero'>;

// HOME-AC-01: the page's only h1. The CityMap slot (right column) arrives in U-08.
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
      </div>
    </section>
  );
}
