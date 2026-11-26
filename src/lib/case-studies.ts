// U-15: the case studies behind /work/<slug> (PROJ-AC-08). Content files hold types-only imports
// (PLAT-AC-09), so the list of case studies lives here, in lib.
import { sluiceCaseStudy } from '@/content/case-studies/sluice';
import type { CaseStudy, WorkItem } from '@/content/types';

import { visible } from './visible';

export const caseStudies: readonly CaseStudy[] = [sluiceCaseStudy];

/** The case study for a slug, or undefined. */
export function caseStudyFor(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}

/** SEO-AC-07, PROJ-AC-08: the items that get a /work/<slug> page: visible ones with `caseStudy: true`. */
export function caseStudyItems(items: readonly WorkItem[], showPlanned: boolean): WorkItem[] {
  return visible(items, showPlanned).filter((item) => item.caseStudy);
}
