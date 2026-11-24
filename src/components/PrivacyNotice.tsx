import type { PrivacyNotice as Notice } from '@/content/types';

// HOME-AC-28: the privacy notice, rendered from src/content/privacy.ts (one h1, an h2 per section).
export function PrivacyNotice({ notice }: { notice: Notice }) {
  return (
    <article className="wrap wrap--narrow stack-lg privacy">
      <header className="stack-sm">
        <h1 className="section-title">{notice.title}</h1>
        <p className="section-intro">
          {notice.updatedLabel}: <time dateTime={notice.updated}>{notice.updated}</time>
        </p>
        <p>
          <a href={notice.controller.contactUrl} rel="me noopener noreferrer" className="contact-link">
            {notice.controller.contactLabel}
          </a>
        </p>
      </header>
      {notice.sections.map((s) => (
        <section key={s.heading} className="stack-sm privacy-section">
          <h2 className="privacy-heading">{s.heading}</h2>
          {s.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {s.items && s.items.length > 0 ? (
            <ul className="privacy-list">
              {s.items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </article>
  );
}
