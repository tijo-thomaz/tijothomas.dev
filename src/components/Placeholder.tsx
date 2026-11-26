import type { ReactNode } from 'react';

import type { Profile } from '@/content/types';

import { Footer } from './Footer';
import { StatusBadge } from './StatusBadge';

type Props = {
  title: string;
  subtitle: string;
  badge?: { text: string; tone: string };
  profile: Pick<Profile, 'name' | 'nav' | 'labels'>;
  children?: ReactNode;
};

// SEO-AC-07: the noindex page behind /work/[slug] and /writing/[slug] until real content exists, and
// /play/[slug] while a demo is not deployed (PROJ-AC-05). Every string comes from src/content.
export function Placeholder({ title, subtitle, badge, profile, children }: Props) {
  return (
    <>
      <main id="main" className="band band--mint placeholder">
        <article className="wrap wrap--narrow stack-sm">
          <a href="/" className="nav-brand">
            {profile.nav.brand}
          </a>
          <h1 className="hero-title placeholder-title">{title}</h1>
          <p className="section-intro">{subtitle}</p>
          {badge ? (
            <p>
              <StatusBadge text={badge.text} tone={badge.tone} />
            </p>
          ) : null}
          {children}
        </article>
      </main>
      <Footer
        name={profile.name}
        year={new Date().getFullYear()}
        terminalLabel={profile.labels.terminalMode}
        privacyLabel={profile.labels.privacy}
      />
    </>
  );
}
