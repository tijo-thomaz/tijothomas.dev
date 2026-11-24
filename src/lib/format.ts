import type { WorkItem, WorkStatus, YearMonth } from '@/content/types';

const MONTH = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });

/** `2026-04` -> `Apr 2026`. UTC, so the build machine's time zone cannot shift the month. */
export function formatMonth(ym: YearMonth | string): string {
  const [year, month] = ym.split('-').map(Number);
  return MONTH.format(new Date(Date.UTC(year, month - 1, 1)));
}

/** `Apr 2026 – present` when `end` is null (the current role), else `Feb 2023 – Nov 2025`. */
export function formatRange(start: YearMonth | string, end: YearMonth | string | null, present: string): string {
  return `${formatMonth(start)} – ${end === null ? present : formatMonth(end)}`;
}

/**
 * Status badge text for a work card (HOME-AC-13). A live item uses its confirmed label (F-16); other
 * statuses use their label plus "· <target month>" when a target is set.
 */
export function workBadge(
  item: Pick<WorkItem, 'status' | 'badgeLabel' | 'target'>,
  labels: Record<WorkStatus, string>,
): string {
  if (item.status === 'live') return item.badgeLabel ?? labels.live;
  return item.target ? `${labels[item.status]} · ${formatMonth(item.target)}` : labels[item.status];
}
