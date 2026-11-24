// SEO-AC-09 and CONT-AC-03 (U-07 review #1, #3): view-source matching semantics.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchHtml, textNodes } from './lib/view-source-match.mjs';

const HTML = [
  '<main><h3>PromptShield</h3><p class="work-stack">Go · React</p>',
  '<span>© <!-- -->2026<!-- --> <!-- -->Tijo Thomas</span>',
  '<p>Let&#x27;s talk &amp; more</p>',
  '<script>self.__next_f.push([1,"hidden payload"])</script></main>',
].join('');

test('SEO-AC-09 text nodes split on tags and React comment separators, decode entities, skip scripts', () => {
  assert.deepEqual(textNodes(HTML), ['PromptShield', 'Go · React', '©', '2026', 'Tijo Thomas', "Let's talk & more"]);
});

test('SEO-AC-09 an expected string must equal a whole text node, not a substring of one', () => {
  assert.deepEqual(matchHtml(HTML, ['PromptShield', 'Go · React', 'Tijo Thomas']).missing, []);
  assert.deepEqual(matchHtml(HTML, ['Go', 'React', 'Prompt']).missing, ['Go', 'React', 'Prompt']);
});

test('SEO-AC-09 a dropped node is reported even when its text appears inside another node', () => {
  const dropped = HTML.replace('<h3>PromptShield</h3>', '').replace('Go · React', 'Measuring PromptShield');
  assert.deepEqual(matchHtml(dropped, ['PromptShield']).missing, ['PromptShield']);
});

test('CONT-AC-03 a forbidden (planned) string anywhere in the raw HTML, the RSC payload included, is a leak', () => {
  assert.deepEqual(matchHtml(HTML, [], ['hidden payload', 'fde-mcp-gateway']).leaked, ['hidden payload']);
});
