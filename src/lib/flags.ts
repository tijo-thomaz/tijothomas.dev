/**
 * Parses SHOW_PLANNED (FR-012). The parse fails closed: only the exact string "true" shows planned
 * work items and posts. "TRUE", "1", " true" and an unset variable all hide them.
 * Call it at build time: `isShowPlanned(process.env.SHOW_PLANNED)`.
 */
export function isShowPlanned(raw: string | undefined): boolean {
  return raw === 'true';
}
