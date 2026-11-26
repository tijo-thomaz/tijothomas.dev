// Projects platform registry rules (U-13, U-14). The registry is `work` in src/content/work.ts.
// Type-only imports: next.config.js requires this module (Node strips the types), and that loader
// does not resolve `@/`.
import type { WorkItem } from '../content/types';

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ORIGIN_ENV = /^[A-Z][A-Z0-9_]*_ORIGIN$/;
// Demos are free-tier Vercel projects (PLATFORM_PROMPT): their production domain is <name>.vercel.app.
const ZONE_HOST = /^[a-z0-9]+(-[a-z0-9]+)*\.vercel\.app$/;

function slugProblems(items: readonly WorkItem[]): string[] {
  const seen = new Set<string>();
  return items.flatMap((item) => {
    const problems: string[] = [];
    if (!KEBAB.test(item.slug)) problems.push(`slug is not kebab-case: ${item.slug}`);
    if (seen.has(item.slug)) problems.push(`duplicate slug: ${item.slug}`);
    seen.add(item.slug);
    return problems;
  });
}

function formerSlugProblems(items: readonly WorkItem[]): string[] {
  const live = new Set(items.map((i) => i.slug));
  const seen = new Set<string>();
  return items.flatMap((item) => {
    const former = item.formerSlug;
    if (former === undefined) return [];
    const problems: string[] = [];
    if (!KEBAB.test(former)) problems.push(`${item.slug}: formerSlug is not kebab-case: ${former}`);
    if (live.has(former)) problems.push(`${item.slug}: formerSlug is a live slug: ${former}`);
    if (seen.has(former)) problems.push(`duplicate formerSlug: ${former}`);
    seen.add(former);
    return problems;
  });
}

/** PROJ-AC-01, PROJ-AC-02, PROJ-AC-06: problems in the registry, one line each. Empty = valid. */
export function registryProblems(items: readonly WorkItem[]): string[] {
  const envProblems = items.flatMap((item) =>
    item.playOriginEnv !== undefined && !ORIGIN_ENV.test(item.playOriginEnv)
      ? [`${item.slug}: playOriginEnv is not an *_ORIGIN env name: ${item.playOriginEnv}`]
      : [],
  );
  return [...slugProblems(items), ...formerSlugProblems(items), ...envProblems];
}

/**
 * PROJ-AC-05: items that get /play/<slug> (a page, a rewrite and header rules). A planned item never
 * does, whatever SHOW_PLANNED says: a demo is public only once its project is in progress or live.
 */
export function playableItems(items: readonly WorkItem[]): WorkItem[] {
  return items.filter((item) => item.playOriginEnv !== undefined && item.status !== 'planned');
}

/**
 * PROJ-AC-02: the demo origin for an item, read from the env var it names. null when the item has no
 * env name or the var is unset or blank (the in-site fallback page is served). Throws when the value
 * is not a bare https origin, so a bad deploy setting fails the build instead of proxying elsewhere.
 */
export function playOrigin(item: WorkItem, env: Readonly<Record<string, string | undefined>>): string | null {
  if (!item.playOriginEnv) return null;
  const raw = env[item.playOriginEnv]?.trim();
  if (!raw) return null;
  const origin = zoneOrigin(raw.endsWith('/') ? raw.slice(0, -1) : raw);
  if (!origin) {
    throw new Error(`${item.playOriginEnv} must be a bare https origin such as https://name.vercel.app (got "${raw}")`);
  }
  return origin;
}

/** A bare origin (no path, query, hash, userinfo or port) on a <name>.vercel.app domain, else null. */
function zoneOrigin(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  const bare = url.protocol === 'https:' && url.origin === value && url.port === '';
  return bare && ZONE_HOST.test(url.hostname) ? url.origin : null;
}

type Env = Readonly<Record<string, string | undefined>>;
type Header = { key: string; value: string };

const playPaths = (slug: string) => [`/play/${slug}`, `/play/${slug}/:path*`] as const;

/**
 * PROJ-AC-03, PROJ-AC-04: multi-zone rewrites for every item whose demo origin is set. They go in
 * `beforeFiles`, because the in-site /play/[slug] page would otherwise win over an afterFiles rewrite.
 */
export function playRewrites(items: readonly WorkItem[], env: Env): { source: string; destination: string }[] {
  return playableItems(items).flatMap((item) => {
    const origin = playOrigin(item, env);
    if (!origin) return [];
    const [root, deep] = playPaths(item.slug);
    return [
      { source: root, destination: `${origin}${root}` },
      { source: deep, destination: `${origin}/play/${item.slug}/:path*` },
    ];
  });
}

/**
 * PROJ-AC-07, PROJ-AC-10: slug -> `/play/<slug>` for each playable item whose demo origin is set. A
 * "Play" link renders only then: while the demo is not deployed the card links to the case study only.
 */
export function playLinks(items: readonly WorkItem[], env: Env): Record<string, string> {
  return Object.fromEntries(
    playableItems(items).flatMap((item) => (playOrigin(item, env) ? [[item.slug, `/play/${item.slug}`]] : [])),
  );
}

/** PROJ-AC-06: a permanent (308) redirect from each item's former slug to its current page. */
export function formerRedirects(items: readonly WorkItem[]): { source: string; destination: string; permanent: true }[] {
  return items.flatMap((item) =>
    item.formerSlug ? [{ source: `/work/${item.formerSlug}`, destination: `/work/${item.slug}`, permanent: true as const }] : [],
  );
}

/**
 * PROJ-AC-12: CSP for a demo served from its own deployment. Same-origin only (the rewrite keeps every
 * asset on tijothomas.dev); `'wasm-unsafe-eval'` only for a WebAssembly demo; no inline or eval script.
 */
export function zoneCsp(item: Pick<WorkItem, 'wasm'>): string {
  return [
    "default-src 'self'",
    `script-src 'self'${item.wasm ? " 'wasm-unsafe-eval'" : ''}`,
    // Inline styles only (style attributes set by UI libraries); they cannot run script.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    // A playground may use a <form> for its input; submissions stay on the site.
    "form-action 'self'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

/**
 * PROJ-AC-11, PROJ-AC-12: header rules for /play/<slug> and /play/<slug>/*. They come after the baseline
 * rule in next.config.js, so their CSP wins. A deployed demo gets `zoneCsp`; while not deployed the
 * in-site Next page is served and needs the site CSP (`siteCsp`). noindex unless `indexPlay`.
 */
export function playHeaderRules(items: readonly WorkItem[], env: Env, siteCsp: string): { source: string; headers: Header[] }[] {
  return playableItems(items).flatMap((item) => {
    const csp = playOrigin(item, env) ? zoneCsp(item) : siteCsp;
    const headers: Header[] = [
      { key: 'Content-Security-Policy', value: csp },
      ...(item.indexPlay ? [] : [{ key: 'X-Robots-Tag', value: 'noindex' }]),
    ];
    return playPaths(item.slug).map((source) => ({ source, headers }));
  });
}
