// Projects platform registry rules (U-13). The registry is `work` in src/content/work.ts.
// Type-only imports: next.config.ts loads this module too, and the config loader does not resolve `@/`.
import type { WorkItem } from '../content/types';

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ORIGIN_ENV = /^[A-Z][A-Z0-9_]*_ORIGIN$/;

/** PROJ-AC-01, PROJ-AC-02: problems in the registry, one line each. Empty = valid. */
export function registryProblems(items: readonly WorkItem[]): string[] {
  const seen = new Set<string>();
  return items.flatMap((item) => {
    const problems: string[] = [];
    if (!KEBAB.test(item.slug)) problems.push(`slug is not kebab-case: ${item.slug}`);
    if (seen.has(item.slug)) problems.push(`duplicate slug: ${item.slug}`);
    seen.add(item.slug);
    if (item.playOriginEnv !== undefined && !ORIGIN_ENV.test(item.playOriginEnv)) {
      problems.push(`${item.slug}: playOriginEnv is not an *_ORIGIN env name: ${item.playOriginEnv}`);
    }
    return problems;
  });
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
  const value = raw.endsWith('/') ? raw.slice(0, -1) : raw;
  let url: URL | null = null;
  try {
    url = new URL(value);
  } catch {
    url = null;
  }
  if (!url || url.protocol !== 'https:' || url.origin !== value) {
    throw new Error(`${item.playOriginEnv} must be a bare https origin such as https://name.vercel.app (got "${raw}")`);
  }
  return url.origin;
}
