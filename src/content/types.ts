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
    skipLink: string;
    highlights: string;
    availability: string;
    linkedin: string;
    github: string;
    terminalMode: string;
    privacy: string;
    caseStudy: string;
    formerly: string;
    demoComingSoon: string;
    play: string;
    projects: string;
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
  /** Earlier public name, shown as "formerly <name>" (PROJ-AC-13). */
  formerName?: string;
  /** Earlier slug; `/work/<formerSlug>` redirects (308) to `/work/<slug>` (PROJ-AC-06). */
  formerSlug?: string;
  /** Public source repository. Unset while the repo is private. */
  repoUrl?: HttpsUrl;
  /**
   * Name of the env var that holds the demo's origin, e.g. `SLUICE_ORIGIN` (PROJ-AC-02). The origin
   * itself never lives in the repo. Unset or empty env = the in-site "Demo coming soon" page.
   */
  playOriginEnv?: `${string}_ORIGIN`;
  /** The demo runs WebAssembly, so its CSP gets `'wasm-unsafe-eval'` (PROJ-AC-12). */
  wasm?: boolean;
  /** The demo ships its own metadata and may be indexed; otherwise `/play/<slug>` is noindex (PROJ-AC-11). */
  indexPlay?: boolean;
  /** A case study exists at `/work/<slug>` (PROJ-AC-07, PROJ-AC-10). */
  caseStudy?: boolean;
}

/** A linear flow drawn as a server-rendered SVG: one box per node, top to bottom (PROJ-AC-08). */
export interface FlowDiagram {
  /** Accessible name of the figure. */
  title: string;
  nodes: readonly string[];
}

/** An external source cited by a case study. Every href cites a P-xx row (PROJ-AC-09). */
export interface CaseStudySource {
  label: string;
  href: HttpsUrl;
}

/**
 * The case study at /work/<slug> (U-15). Sections and their headings follow PROJ-AC-08. While there is
 * no eval report, `evaluation` holds only its status line: no numbers, no table.
 */
export interface CaseStudy {
  slug: string;
  /** Lede under the title and the meta description. */
  description: string;
  problem: { heading: string; paragraphs: readonly string[] };
  whyItMatters: {
    heading: string;
    items: readonly string[];
    sourcesHeading: string;
    sources: readonly CaseStudySource[];
  };
  architecture: {
    heading: string;
    today: {
      heading: string;
      diagram: FlowDiagram;
      parts: readonly { name: string; does: string; problem: string }[];
      labels: { does: string; problem: string };
    };
    target: {
      heading: string;
      diagram: FlowDiagram;
      parts: readonly Step[];
      toolGateway: { heading: string; items: readonly string[] };
    };
  };
  evaluation: { heading: string; status: string };
  tradeOffs: {
    heading: string;
    decisions: readonly { decision: string; why: string; tradeOff: string }[];
    labels: { why: string; tradeOff: string };
    limitsHeading: string;
    limits: readonly string[];
  };
}

/** The privacy notice at /privacy (U-10, ADR-P3). One source for the page and the terminal link. */
export interface PrivacyNotice {
  title: string;
  description: string;
  updated: YearMonth | `${number}-${number}${number}-${number}${number}`;
  updatedLabel: string;
  controller: { name: string; contactUrl: HttpsUrl; contactLabel: string };
  sections: readonly { heading: string; paragraphs: readonly string[]; items?: readonly string[] }[];
}

export type PostStatus = 'published' | 'coming-soon' | 'planned';

export interface Post {
  slug: string;
  title: string;
  subtitle: string;
  status: PostStatus;
  url?: HttpsUrl;
}
