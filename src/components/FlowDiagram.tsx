import type { FlowDiagram as Flow } from '@/content/types';

const WIDTH = 320;
const BOX = 40;
const GAP = 24;
const PAD = 2;

// PROJ-AC-08: a linear flow as a server-rendered SVG, one box per node from top to bottom. No script,
// no external asset; it scales down to the column width. Colours come from CSS (theme tokens).
export function FlowDiagram({ diagram, id }: { diagram: Flow; id: string }) {
  const titleId = `${id}-title`;
  const height = diagram.nodes.length * (BOX + GAP) - GAP + PAD * 2;
  return (
    <svg
      className="flow"
      viewBox={`0 0 ${WIDTH} ${height}`}
      role="img"
      aria-labelledby={titleId}
    >
      <title id={titleId}>{diagram.title}</title>
      {diagram.nodes.map((node, i) => {
        const y = PAD + i * (BOX + GAP);
        return (
          <g key={node}>
            <rect className="flow-box" x={PAD} y={y} width={WIDTH - PAD * 2} height={BOX} rx={8} />
            <text className="flow-text" x={WIDTH / 2} y={y + BOX / 2} textAnchor="middle" dominantBaseline="central">
              {node}
            </text>
            {i < diagram.nodes.length - 1 ? (
              <path className="flow-arrow" d={`M${WIDTH / 2} ${y + BOX + 4}v${GAP - 10}m-5 -6l5 6l5 -6`} />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
