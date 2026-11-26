import type { Profile, WorkItem } from '@/content/types';
import { workBadge } from '@/lib/format';

import { Placeholder } from './Placeholder';

// PROJ-AC-05: /play/<slug> while the demo is not deployed. Links to the case study and, only when the
// repo is public, the source. Every string comes from src/content.
export function PlayFallback({ item, profile }: { item: WorkItem; profile: Profile }) {
  const { labels } = profile;
  return (
    <Placeholder
      title={item.name}
      subtitle={item.subtitle}
      badge={{ text: workBadge(item, labels.workStatus), tone: item.status }}
      profile={profile}
    >
      <p className="section-intro">{labels.demoComingSoon}</p>
      <p className="placeholder-links">
        {item.caseStudy ? (
          <a href={`/work/${item.slug}`} className="work-link">
            {labels.caseStudy}
          </a>
        ) : null}
        {item.repoUrl ? (
          <a href={item.repoUrl} className="work-link" target="_blank" rel="noopener noreferrer">
            {labels.github}
          </a>
        ) : null}
      </p>
    </Placeholder>
  );
}
