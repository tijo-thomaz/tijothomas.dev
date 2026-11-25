// Types for the CityMap geometry (cityGeometry.ts). A shape is an SVG element name plus its attributes
// (camelCase, as React expects). `label: 'true'` marks a building's text, whose content comes from
// the nav labels in src/content.
export type ShapeTag = 'polygon' | 'circle' | 'rect' | 'path' | 'ellipse' | 'text';
export type Shape = readonly [ShapeTag, Readonly<Record<string, string>>];

export type Segment =
  | { readonly k: 'shapes'; readonly shapes: readonly Shape[] }
  | { readonly k: 'building'; readonly href: string; readonly shapes: readonly Shape[] }
  | { readonly k: 'car'; readonly shapes: readonly Shape[] }
  | { readonly k: 'sign'; readonly post: readonly Shape[]; readonly board: { readonly x: number; readonly y: number } };
