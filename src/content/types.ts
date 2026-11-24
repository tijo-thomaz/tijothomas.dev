// Types for the site content (U-05). Every fact and line of UI copy lives in src/content/*.ts and is
// typed here. Nullable fields are omitted from the page while null, never shown as placeholders.

/** An absolute https URL (CONT-AC-13). */
export type HttpsUrl = `https://${string}`;
/** An in-page anchor such as `#work`. */
export type Anchor = `#${string}`;
/** A year and month, `YYYY-MM`. The shape is checked at runtime (CONT-AC-11). */
export type YearMonth = `${number}-${number}${number}`;

export interface Link {
  label: string;
  href: Anchor | HttpsUrl | `/${string}`;
}

export interface Highlight {
  value: string;
  label: string;
}

export interface Step {
  title: string;
  text: string;
}

/** The owner profile. ADR-P5: no `email`, `phone` or `whatsapp` field (CONT-AC-15). */
export interface Profile {
  name: string;
  headline: string;
  jobTitle: string;
  location: string;
  relocation: {
    summary: string;
    visaSponsorshipRequired: boolean;
    visaLabel: string;
  };
  /** Shown in Contact only when set. */
  availability: string | null;
  /** Shown in Contact only when set. */
  noticePeriod: string | null;
  coreStack: readonly string[];
  siteUrl: HttpsUrl;
  links: {
    linkedin: HttpsUrl;
    github: HttpsUrl;
  };
  knowsAbout: readonly string[];
  nav: {
    brand: string;
    items: readonly Link[];
  };
  hero: {
    intro: string;
    primaryCta: Link;
    secondaryCta: Link;
    tip: string;
  };
  city: {
    label: string;
    signposts: readonly string[];
  };
  highlights: readonly Highlight[];
  howIWork: readonly [Step, Step, Step, Step, Step];
  sections: {
    work: { title: string; intro: string; empty: string };
    experience: { title: string; intro: string };
    howIWork: { title: string };
    writing: { title: string; intro: string; empty: string };
    contact: { title: string; intro: string };
  };
  labels: {
    now: string;
    present: string;
    notMeasured: string;
    workStatus: Record<WorkStatus, string>;
    /** A published post renders as a link with no badge. */
    postStatus: Record<Exclude<PostStatus, 'published'>, string>;
  };
  seo: {
    title: string;
    description: string;
  };
}

interface ExperienceBase {
  id: string;
  start: YearMonth;
}

export interface ExperienceJob extends ExperienceBase {
  kind: 'job';
  company: string;
  monogram: string;
  title: string;
  /** null = current role ("present"). */
  end: YearMonth | null;
  location: string;
  workMode?: string;
  bullets: readonly string[];
}

export interface ExperienceGap extends ExperienceBase {
  kind: 'gap';
  label: string;
  tile: string;
  end: YearMonth;
}

export type ExperienceEntry = ExperienceJob | ExperienceGap;

export type WorkStatus = 'live' | 'in-progress' | 'planned';

export interface WorkItem {
  slug: string;
  name: string;
  subtitle: string;
  status: WorkStatus;
  /** Confirmed label for a `live` item, e.g. "Proof of concept" (F-16). */
  badgeLabel?: string;
  /** Target month for in-progress or planned items. */
  target?: YearMonth;
  summary: string;
  /** null = no metric row. A null `value` renders "Not yet measured". */
  metric: { label: string; value: string | null } | null;
  stack: readonly string[];
  caseStudyUrl?: HttpsUrl;
}

export type PostStatus = 'published' | 'coming-soon' | 'planned';

export interface Post {
  slug: string;
  title: string;
  subtitle: string;
  status: PostStatus;
  url?: HttpsUrl;
}
