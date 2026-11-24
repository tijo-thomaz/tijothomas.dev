import type { ExperienceEntry, ExperienceGap, ExperienceJob, Profile } from '@/content/types';
import { formatRange } from '@/lib/format';

type Labels = Profile['labels'];

function Job({ entry, labels }: { entry: ExperienceJob; labels: Labels }) {
  const place = [entry.location, entry.workMode].filter(Boolean).join(' · ');
  return (
    <li className="exp-row" data-entry={entry.id}>
      <span className="monogram" aria-hidden="true">
        {entry.monogram}
      </span>
      <div className="card exp-card">
        <h3 className="card-title">{entry.company}</h3>
        <p className="exp-title">{entry.title}</p>
        <p className="exp-meta">
          <span className="exp-dates">{formatRange(entry.start, entry.end, labels.present)}</span>
          <span>{place}</span>
          {entry.end === null ? <span className="badge badge-now">{labels.now}</span> : null}
        </p>
        {entry.bullets.length > 0 ? (
          <ul className="exp-bullets">
            {entry.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}

function Gap({ entry, labels }: { entry: ExperienceGap; labels: Labels }) {
  return (
    <li className="exp-row exp-row--gap" data-entry={entry.id}>
      <span className="tile-gap" aria-hidden="true">
        {entry.tile}
      </span>
      <div className="exp-gap">
        <p className="exp-gap-label">{entry.label}</p>
        <p className="exp-meta">{formatRange(entry.start, entry.end, labels.present)}</p>
      </div>
    </li>
  );
}

// HOME-AC-14: newest first whatever the input order; gaps get a dashed tile and no card.
export function ExperienceTimeline({
  entries,
  section,
  labels,
}: {
  entries: readonly ExperienceEntry[];
  section: Profile['sections']['experience'];
  labels: Labels;
}) {
  const sorted = [...entries].sort((a, b) => b.start.localeCompare(a.start));
  return (
    <section id="experience" aria-labelledby="experience-title" className="band section">
      <div className="wrap wrap--narrow stack-sm">
        <h2 id="experience-title" className="section-title">
          {section.title}
        </h2>
        <p className="section-intro">{section.intro}</p>
        {/* Safari drops list semantics from a styled <ul> outside <nav>; role="list" restores them. */}
        {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
        <ol className="timeline" role="list">
          {sorted.map((e) =>
            e.kind === 'job' ? <Job key={e.id} entry={e} labels={labels} /> : <Gap key={e.id} entry={e} labels={labels} />,
          )}
        </ol>
      </div>
    </section>
  );
}
