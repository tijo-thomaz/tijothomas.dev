import { Footer } from '@/components/Footer';
import { PrivacyNotice } from '@/components/PrivacyNotice';
import { privacy } from '@/content/privacy';
import { profile } from '@/content/profile';
import { siteUrl } from '@/lib/site';

import type { Metadata } from 'next';

// HOME-AC-28: a static, indexable privacy notice; text from src/content/privacy.ts (ADR-P3).
export const metadata: Metadata = {
  title: privacy.title,
  description: privacy.description,
  alternates: { canonical: `${siteUrl}/privacy` },
};

export default function PrivacyPage() {
  return (
    <>
      <main id="main" className="band band--mint section">
        <p className="wrap wrap--narrow">
          <a href="/" className="nav-brand">
            {profile.nav.brand}
          </a>
        </p>
        <PrivacyNotice notice={privacy} />
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
