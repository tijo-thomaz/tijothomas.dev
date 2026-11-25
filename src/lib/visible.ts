/**
 * Drops `planned` items unless planned items are shown (FR-012). The order is kept. The filter runs at
 * build time, so hidden items are absent from the HTML, not hidden with CSS.
 */
export function visible<T extends { status: string }>(items: readonly T[], showPlanned: boolean): T[] {
  return items.filter((item) => showPlanned || item.status !== 'planned');
}
