// SEO-AC-09 (U-07, Verify: gate): the view-source gate takes its expected strings from src/content
// (respecting SHOW_PLANNED), not from a hand-kept list, and it is enforced in gates.yml.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readText } from './lib/test-utils.mjs';

const { expectedStrings } = await import('./lib/content-strings.mjs');

test('SEO-AC-09 expected strings cover every section of / and come from src/content', async () => {
  const list = await expectedStrings({ showPlanned: false });
  assert.ok(list.length >= 60, `only ${list.length} strings`);
  for (const s of [
    'Lead Software Engineer building reliable AI systems', // hero h1
    'Selected work', 'Sluice', 'Guardrail gateway for AI agents', 'In progress', 'formerly PromptShield', // work (P-01..P-04)
    'bet365 Group Ltd', 'Relocation: UK to India with family', // experience
    'How I work with customers', 'Break and measure', // how I work
    'Lessons from breaking things', 'Why queues double-charge customers, and the fix', // writing
    "Let's talk", 'LinkedIn', 'GitHub', 'Terminal mode', // contact, footer
  ]) assert.ok(list.includes(s), `missing ${s}`);
});

test('SEO-AC-09 planned items are expected only when SHOW_PLANNED is "true"', async () => {
  const hidden = await expectedStrings({ showPlanned: false });
  const shown = await expectedStrings({ showPlanned: true });
  assert.ok(!hidden.includes('fde-mcp-gateway'));
  assert.ok(shown.includes('fde-mcp-gateway'));
});

test('SEO-AC-09 null and absent fields are not expected (no "null", no empty strings)', async () => {
  const list = await expectedStrings({ showPlanned: true });
  assert.deepEqual(list.filter((s) => typeof s !== 'string' || !s.trim() || s === 'null'), []);
});

test('SEO-AC-09 gates.yml enforces the view-source gate', () => {
  const block = readText('gates.yml').split(/\n\s*-\s+id:\s*/).find((b) => b.startsWith('view-source'));
  assert.ok(block, 'no view-source gate');
  assert.match(block, /enforce:\s*true/);
});
