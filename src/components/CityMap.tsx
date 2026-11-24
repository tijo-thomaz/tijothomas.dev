import { createElement, Fragment } from 'react';

import type { Profile } from '@/content/types';

import { citySegments } from './cityGeometry';
import type { Segment, Shape } from './cityTypes';

type Props = { city: Profile['city']; nav: Profile['nav'] };

// Board size follows the mockup's signs: 13px bold labels, about 8.4 units per character plus padding.
const BOARD_H = 26;
const BOARD_GAP = 4;
const boardWidth = (text: string) => Math.round(22 + 8.4 * text.length);

// Building label pills: the mockup's widths fit 30 + 9.2 units per character (Work 66.8,
// Writing/Contact 94.4, Experience 122.0), so the pill is sized from the content label, centred on
// the label text (U-08 review #1).
const pillWidth = (text: string) => 30 + 9.2 * text.length;

const draw = ([tag, attrs]: Shape, key: number, label?: string) => {
  const { label: isLabel, ...rest } = attrs;
  return createElement(tag, { key, ...rest }, isLabel ? label : undefined);
};

function Building({ seg, label }: { seg: Extract<Segment, { k: 'building' }>; label: string }) {
  const text = seg.shapes.find(([tag]) => tag === 'text');
  const cx = Number(text?.[1].x ?? 0);
  const width = pillWidth(label);
  return (
    <a href={seg.href} aria-label={label} className="city-building">
      {/* The lift moves this group, not the link's hit area, so the hover edge cannot flicker. */}
      <g className="city-building-body">
        {seg.shapes.map((s, j) => {
          const [tag, a] = s;
          if (tag === 'rect' && a.className === 'city-label-bg') {
            return draw([tag, { ...a, x: (cx - width / 2).toFixed(1), width: width.toFixed(1) }], j);
          }
          return draw(s, j, label);
        })}
      </g>
    </a>
  );
}

// The signposts' labels split across the posts in order: with 4 labels and 2 posts, 2 boards each,
// stacked top to bottom.
function signLabels(signposts: readonly string[], posts: number, index: number) {
  const per = Math.ceil(signposts.length / posts);
  return signposts.slice(index * per, index * per + per);
}

function Sign({ seg, labels }: { seg: Extract<Segment, { k: 'sign' }>; labels: readonly string[] }) {
  const { x, y } = seg.board;
  return (
    <g className="city-sign">
      {seg.post.map((s, i) => draw(s, i))}
      {labels.map((text, i) => {
        const top = y - (labels.length - 1 - i) * (BOARD_H + BOARD_GAP);
        return (
          <Fragment key={i}>
            <rect x={x} y={top} width={boardWidth(text)} height={BOARD_H} rx="5" className="city-board" />
            <text x={x + 11} y={top + 18} className="city-board-text">
              {text}
            </text>
          </Fragment>
        );
      })}
    </g>
  );
}

// HOME-AC-08/10: the mockup's isometric city as navigation. Buildings are links named by the nav
// labels; accents and focus colours come from CSS. Server component, no client JS.
export function CityMap({ city, nav }: Props) {
  // A building without a nav entry would be a nameless link: fail the build instead (U-08 review #2).
  const labelFor = (href: string) => {
    const label = nav.items.find((i) => i.href === href)?.label;
    if (!label) throw new Error(`CityMap ${href}: unlabelled building`);
    return label;
  };
  const posts = citySegments.filter((s) => s.k === 'sign').length;
  let signIndex = 0;
  // The map is navigation (four section links), so it is a <nav> named by the content label. The svg
  // has no img role, which would hide its links from assistive technology.
  return (
    <nav aria-label={city.label} className="city-nav">
    <svg viewBox="-418 -303 837 794" className="city-map">
      {citySegments.map((seg, i) => {
        if (seg.k === 'building') {
          return <Building key={i} seg={seg} label={labelFor(seg.href)} />;
        }
        if (seg.k === 'car') {
          return (
            <g key={i} className="city-car">
              {seg.shapes.map((s, j) => draw(s, j))}
            </g>
          );
        }
        if (seg.k === 'sign') {
          return <Sign key={i} seg={seg} labels={signLabels(city.signposts, posts, signIndex++)} />;
        }
        return <Fragment key={i}>{seg.shapes.map((s, j) => draw(s, j))}</Fragment>;
      })}
    </svg>
    </nav>
  );
}
