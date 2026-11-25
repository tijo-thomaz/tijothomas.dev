import type { Highlight } from '@/content/types';

// HOME-AC-12: one tile per highlight; no region at all when the list is empty.
export function Highlights({ items, label }: { items: readonly Highlight[]; label: string }) {
  if (items.length === 0) return null;
  return (
    <section aria-label={label} className="band band--surface">
      {/* Safari drops list semantics from a styled <ul> outside <nav>; role="list" restores them. */}
      {/* oxlint-disable-next-line jsx-a11y/no-redundant-roles */}
      <ul className="tiles wrap" role="list">
        {items.map((h) => (
          <li key={h.value} className="tile">
            <span className="tile-value">{h.value}</span>
            <span className="tile-label">{h.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
