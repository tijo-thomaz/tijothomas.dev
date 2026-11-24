import type { Profile, WorkItem } from '@/content/types';

import { WorkCard } from './WorkCard';

// HOME-AC-13, CONT-AC-06: the section keeps its id and h2 even when every item is hidden.
export function WorkSection({
  items,
  section,
  labels,
}: {
  items: readonly WorkItem[];
  section: Profile['sections']['work'];
  labels: Profile['labels'];
}) {
  return (
    <section id="work" aria-labelledby="work-title" className="band band--surface section">
      <div className="wrap stack-lg">
        <header className="section-head">
          <h2 id="work-title" className="section-title">
            {section.title}
          </h2>
          <p className="section-intro">{section.intro}</p>
        </header>
        {items.length > 0 ? (
          <div className="card-grid">
            {items.map((item) => (
              <WorkCard key={item.slug} item={item} labels={labels} />
            ))}
          </div>
        ) : (
          <p className="empty">{section.empty}</p>
        )}
      </div>
    </section>
  );
}
