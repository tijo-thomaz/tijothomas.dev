// SEO-AC-09 matching for the view-source gate (U-07 review #1, #3).
// - Expected strings must each equal one whole visible text node (after whitespace collapse), so a
//   short string ("Go", "PromptShield") cannot pass by sitting inside a longer node.
// - Forbidden strings (planned items while SHOW_PLANNED is off) must appear nowhere in the raw HTML,
//   including the inline RSC payload scripts.
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };
export const decode = (s) => s.replace(/&(#\d+|#x[\da-f]+|\w+);/gi, (m, e) => {
  if (ENTITIES[e]) return ENTITIES[e];
  if (/^#x/i.test(e)) return String.fromCodePoint(parseInt(e.slice(2), 16));
  return e.startsWith('#') ? String.fromCodePoint(Number(e.slice(1))) : m;
});
export const norm = (s) => s.replace(/\s+/g, ' ').trim();

/** Visible text nodes of server HTML: text between tags and React's <!-- --> separators. */
export function textNodes(html) {
  return html
    .replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1>/gi, '<x>')
    .split(/<!--[\s\S]*?-->|<[^>]+>/)
    .map((t) => norm(decode(t)))
    .filter(Boolean);
}

export function matchHtml(html, expected, forbidden = []) {
  const nodes = new Set(textNodes(html));
  return {
    nodes: nodes.size,
    missing: expected.filter((s) => !nodes.has(norm(s))),
    leaked: forbidden.filter((s) => html.includes(s)),
  };
}
