import type { Profile, WorkItem } from '@/content/types';
import { workBadge } from '@/lib/format';

import { MetricRow } from './MetricRow';
import { StatusBadge } from './StatusBadge';

type Props = {
  item: WorkItem;
  labels: Profile['labels'];
  /** `/play/<slug>` when the demo origin is set (PROJ-AC-10); no "Play" link otherwise. */
  playHref?: string;
  /** h3 under the home page's h2; h2 on /projects, where the page title is the h1. */
  headingLevel?: 2 | 3;
};

// HOME-AC-13, PROJ-AC-07, PROJ-AC-10: one work item. "Read the case study" links to /work/<slug> when
// the item has a case study, else to caseStudyUrl when set (RQ-04). Plain <a> links: /play/<slug> may
// be served by another deployment, so client-side navigation must not try to render it.
export function WorkCard({ item, labels, playHref, headingLevel = 3 }: Props) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const caseHref = item.caseStudy ? `/work/${item.slug}` : item.caseStudyUrl;
  return (
    <article className="card work-card">
      <div className="work-head">
        <div>
          <Heading className="card-title">{item.name}</Heading>
          <p className="card-subtitle">{item.subtitle}</p>
          {item.formerName ? <p className="card-former">{`${labels.formerly} ${item.formerName}`}</p> : null}
        </div>
        <StatusBadge text={workBadge(item, labels.workStatus)} tone={item.status} />
      </div>
      <p className="work-summary">{item.summary}</p>
      <MetricRow metric={item.metric} notMeasured={labels.notMeasured} />
      <p className="work-stack">{item.stack.join(' · ')}</p>
      {caseHref || playHref ? (
        <p className="work-links">
          {caseHref ? (
            <a href={caseHref} className="work-link">
              {labels.caseStudy}
            </a>
          ) : null}
          {playHref ? (
            <a href={playHref} className="work-link">
              {labels.play}
            </a>
          ) : null}
        </p>
      ) : null}
    </article>
  );
}
