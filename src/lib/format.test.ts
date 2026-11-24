// U-07: date and status-badge formatting for the home lists (no copy here: labels come from content).
import { describe, expect, it } from 'vitest';

import { profile } from '@/content/profile';

import { formatMonth, formatRange, workBadge } from './format';

const labels = profile.labels;

describe('formatMonth / formatRange', () => {
  it('HOME-AC-14 formats YYYY-MM as "Mon YYYY" in UTC', () => {
    expect(formatMonth('2026-04')).toBe('Apr 2026');
    expect(formatMonth('2016-11')).toBe('Nov 2016');
    expect(formatMonth('2023-01')).toBe('Jan 2023');
  });

  it('HOME-AC-14 every month is a three-letter abbreviation (September is "Sep", not "Sept")', () => {
    const months = Array.from({ length: 12 }, (_, i) => formatMonth(`2026-${String(i + 1).padStart(2, '0')}`));
    expect(months).toEqual(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => `${m} 2026`));
  });

  it('HOME-AC-14 a range ends with the "present" label only when end is null', () => {
    expect(formatRange('2026-04', null, labels.present)).toBe('Apr 2026 – present');
    expect(formatRange('2023-02', '2025-11', labels.present)).toBe('Feb 2023 – Nov 2025');
  });
});

describe('workBadge', () => {
  it('HOME-AC-13 live uses the confirmed badgeLabel, else the Live label', () => {
    expect(workBadge({ status: 'live', badgeLabel: 'Proof of concept' }, labels.workStatus)).toBe('Proof of concept');
    expect(workBadge({ status: 'live' }, labels.workStatus)).toBe('Live');
  });

  it('HOME-AC-13 in-progress and planned use their labels plus "· <target>" when a target is set', () => {
    expect(workBadge({ status: 'in-progress', target: '2026-12' }, labels.workStatus)).toBe('In progress · Dec 2026');
    expect(workBadge({ status: 'planned', target: '2026-12' }, labels.workStatus)).toBe('Planned · Dec 2026');
    expect(workBadge({ status: 'planned' }, labels.workStatus)).toBe('Planned');
  });
});
