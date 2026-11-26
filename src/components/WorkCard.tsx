import type { Profile, WorkItem } from '@/content/types';
import { workBadge } from '@/lib/format';

import { MetricRow } from './MetricRow';
import { StatusBadge } from './StatusBadge';

// HOME-AC-13: one work item. The case-study link renders only when the item has a URL (RQ-04).
export function WorkCard({ item, labels }: { item: WorkItem; labels: Profile['labels'] }) {
  return (
    <article className="card work-card">
      <div className="work-head">
        <div>
          <h3 className="card-title">{item.name}</h3>
          <p className="card-subtitle">{item.subtitle}</p>
          {item.formerName ? <p className="card-former">{`${labels.formerly} ${item.formerName}`}</p> : null}
        </div>
        <StatusBadge text={workBadge(item, labels.workStatus)} tone={item.status} />
      </div>
      <p className="work-summary">{item.summary}</p>
      <MetricRow metric={item.metric} notMeasured={labels.notMeasured} />
      <p className="work-stack">{item.stack.join(' · ')}</p>
      {item.caseStudyUrl ? (
        <a href={item.caseStudyUrl} className="work-link">
          {labels.caseStudy}
        </a>
      ) : null}
    </article>
  );
}
