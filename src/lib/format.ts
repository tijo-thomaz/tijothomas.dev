import type { WorkItem, WorkStatus, YearMonth } from '@/content/types';

// Fixed three-letter months. Intl's en-GB short month gives "Sept", and its output depends on the
// ICU data of the build machine (U-07 review #6). No Date object, so no time zone can shift a month.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** `2026-04` -> `Apr 2026`. */
export function formatMonth(ym: YearMonth | string): string {
  const [year, month] = ym.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`;
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
