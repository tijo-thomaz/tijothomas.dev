import type { WorkItem } from '@/content/types';

// CONT-AC-01/02: the value, or "Not yet measured" when it is null. No row at all when metric is null.
export function MetricRow({ metric, notMeasured }: { metric: WorkItem['metric']; notMeasured: string }) {
  if (metric === null) return null;
  return (
    <p className="metric">
      <span className="metric-label">{metric.label}:</span>{' '}
      <span className="metric-value">{metric.value ?? notMeasured}</span>
    </p>
  );
}
