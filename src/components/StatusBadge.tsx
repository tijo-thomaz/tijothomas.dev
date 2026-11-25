// A pill for a work or post status. `tone` picks the colour (live, in-progress, planned, coming-soon).
export function StatusBadge({ text, tone }: { text: string; tone: string }) {
  return <span className={`badge badge--${tone}`}>{text}</span>;
}
