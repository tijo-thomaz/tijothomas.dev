import type { Profile } from '@/content/types';

// HOME-AC-15: a region named by its h2, with the five steps as an ordered list.
export function HowIWork({ steps, title }: { steps: Profile['howIWork']; title: string }) {
  return (
    <section aria-labelledby="how-title" className="band band--ink section">
      <div className="wrap stack-lg">
        <h2 id="how-title" className="section-title section-title--light">
          {title}
        </h2>
        {/* Safari drops list semantics from a styled <ol> outside <nav>; role="list" restores them. */}
        {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
        <ol className="steps" role="list">
          {steps.map((step, i) => (
            <li key={step.title} className="step">
              <span className="step-number" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-text">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
