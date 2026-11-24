import type { Profile } from '@/content/types';

type ContactProfile = Pick<Profile, 'sections' | 'availability' | 'links' | 'labels'>;

// HOME-AC-17: LinkedIn and GitHub only (ADR-P5: no email). Availability is omitted while null.
export function Contact({ profile }: { profile: ContactProfile }) {
  const { sections, availability, links, labels } = profile;
  const contactLinks = [
    { href: links.linkedin, label: labels.linkedin },
    { href: links.github, label: labels.github },
  ];

  return (
    <section id="contact" aria-labelledby="contact-title" className="band band--mint">
      <div className="contact wrap">
        <div className="contact-copy">
          <h2 id="contact-title" className="section-title">
            {sections.contact.title}
          </h2>
          <p className="contact-intro">{sections.contact.intro}</p>
          {availability ? (
            <p className="contact-availability">
              <strong>{labels.availability}:</strong> {availability}
            </p>
          ) : null}
        </div>
        {/* Safari drops list semantics from a styled <ul> outside <nav>; role="list" restores them. */}
        {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
        <ul className="contact-card" role="list">
          {contactLinks.map((l) => (
            <li key={l.href}>
              <a href={l.href} rel="me noopener noreferrer" className="contact-link">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
