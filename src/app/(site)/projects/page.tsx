import { Footer } from '@/components/Footer';
import { WorkCard } from '@/components/WorkCard';
import { profile } from '@/content/profile';
import { work } from '@/content/work';
import { isShowPlanned } from '@/lib/flags';
import { playLinks } from '@/lib/projects';
import { siteUrl } from '@/lib/site';
import { visible } from '@/lib/visible';

import type { Metadata } from 'next';

const url = `${siteUrl}/projects`;

// PROJ-AC-16: indexable, with its own title, description and canonical.
export const metadata: Metadata = {
  title: profile.labels.projects,
  description: profile.sections.work.intro,
  alternates: { canonical: url },
  openGraph: { type: 'website', url, title: profile.labels.projects, description: profile.sections.work.intro },
};

// PROJ-AC-07: /projects, one card per visible registry item. A static server page; SHOW_PLANNED and
// the demo origins are read at build time.
export default function ProjectsPage() {
  const { labels } = profile;
  const items = visible(work, isShowPlanned(process.env.SHOW_PLANNED));
  const play = playLinks(work, process.env);
  return (
    <>
      <main id="main" className="band band--surface section">
        <div className="wrap stack-lg">
          <header className="section-head stack-sm">
            <a href="/" className="nav-brand">
              {profile.nav.brand}
            </a>
            <h1 className="hero-title placeholder-title">{labels.projects}</h1>
            <p className="section-intro">{profile.sections.work.intro}</p>
          </header>
          {items.length > 0 ? (
            <div className="card-grid">
              {items.map((item) => (
                <WorkCard key={item.slug} item={item} labels={labels} playHref={play[item.slug]} headingLevel={2} />
              ))}
            </div>
          ) : (
            <p className="empty">{profile.sections.work.empty}</p>
          )}
        </div>
      </main>
      <Footer
        name={profile.name}
        year={new Date().getFullYear()}
        terminalLabel={labels.terminalMode}
        privacyLabel={labels.privacy}
      />
    </>
  );
}
