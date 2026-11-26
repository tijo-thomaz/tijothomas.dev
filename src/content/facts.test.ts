// U-05 CONT-AC-10: every fact in src/content/*.ts traces to an owner-answered row of the facts sheet.
// edd-docs/questions/1.1-facts.md and 1.1-facts-resolved.md are read-only fixtures here; product code
// never imports edd-docs/.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { experience } from './experience';
import { posts } from './posts';
import { profile } from './profile';
import { work } from './work';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const read = (rel: string) => fs.readFileSync(path.join(repo, rel), 'utf8');
const FACTS = read('edd-docs/questions/1.1-facts.md');
const RESOLVED = read('edd-docs/questions/1.1-facts-resolved.md');
const REQUIREMENTS = read('edd-docs/questions/1.1-requirements.md');
const COMPLIANCE = read('edd-docs/inception/compliance.md');
// privacy.ts (U-10) states processing facts from the approved compliance assessment; its lines cite
// CMP-xx requirements, which must exist in compliance.md.
const DATA_FILES = ['profile.ts', 'experience.ts', 'work.ts', 'posts.ts', 'privacy.ts'];

const PROJECT_FACTS = read('edd-docs/questions/2.0-projects-facts.md');

const ROW_ID = /\b[FCP]-\d{2}\b/g;

// Projects platform rows (P-xx, 2.0-projects-facts.md): publishable once the answer column is not "Open".
const projectAnswers = new Map<string, string>(
  PROJECT_FACTS.split(/\r?\n/)
    .filter((l) => /^\|\s*P-\d{2}\s*\|/.test(l))
    .map((l) => {
      const cells = l.split('|').map((c) => c.trim());
      return [cells[1], cells[cells.length - 2]] as [string, string];
    }),
);

// Owner answers from 1.1-facts.md: the last cell of each `| F-xx |` / `| C-xx |` table row.
const answers = new Map<string, string>(
  FACTS.split(/\r?\n/)
    .filter((l) => /^\|\s*[FC]-\d{2}\s*\|/.test(l))
    .map((l) => {
      const cells = l.split('|').map((c) => c.trim());
      return [cells[1], cells[cells.length - 2]] as [string, string];
    }),
);

// Row IDs named in the first cell of a 1.1-facts-resolved.md table row; ranges "F-22..F-29" expand.
const expand = (cell: string): string[] =>
  cell.split(',').flatMap((part) => {
    const m = part.trim().match(/^([FC])-(\d{2})\.\.\1-(\d{2})$/);
    if (!m) return part.match(ROW_ID) ?? [];
    const ids: string[] = [];
    for (let n = Number(m[2]); n <= Number(m[3]); n++) ids.push(`${m[1]}-${String(n).padStart(2, '0')}`);
    return ids;
  });
const resolved = new Set(
  RESOLVED.split(/\r?\n/)
    .filter((l) => /^\|\s*[FC]-\d{2}/.test(l))
    .flatMap((l) => expand(l.split('|')[1])),
);

// Rows the resolutions say NOT to publish (each must be named in 1.1-facts-resolved.md).
const WITHHELD: Record<string, string> = {
  'F-18': 'PromptShield metric row removed',
  'F-63': 'notice period omitted',
  'F-64': 'superseded: no email anywhere on the site',
  'F-66': 'footer tagline removed',
  'F-71': 'no public project links',
  'F-72': 'no current CV; CV button hidden',
};

const confirmed = (answer: string) => /^(confirm|correct|edit\b)/i.test(answer);
const publishable = (id: string) =>
  id.startsWith('P-')
    ? projectAnswers.has(id) && !/\bOpen\b/.test(projectAnswers.get(id) ?? 'Open')
    : answers.has(id) && !(id in WITHHELD) && !/^remove\b/i.test(answers.get(id) ?? '') &&
  (resolved.has(id) || confirmed(answers.get(id) ?? ''));

type SourceLine = { file: string; n: number; code: string; comment: string };
const sourceLines: SourceLine[] = DATA_FILES.flatMap((file) =>
  read(path.relative(repo, path.join(here, file)))
    .split(/\r?\n/)
    .map((line, i) => {
      const at = line.search(/\s\/\/\s/);
      return {
        file,
        n: i + 1,
        code: at === -1 ? line : line.slice(0, at),
        comment: at === -1 ? '' : line.slice(at),
      };
    })
    .filter((l) => !/^\s*(\/\/|import\b|\*|\/\*)/.test(l.code)),
);
// A data line holds a literal value: a string, a number, true/false or null.
const isDataLine = (code: string) => /(:\s*|^\s*|\[\s*)(['"`]|-?\d|true\b|false\b|null\b)/.test(code);

describe('facts sheet fixtures', () => {
  it('CONT-AC-10 the facts sheet has 90 rows and the resolutions cover every ambiguous one', () => {
    expect(answers.size).toBe(90);
    expect(RESOLVED).toMatch(/All 90 rows resolved/);
    expect(Object.keys(WITHHELD).filter((id) => !resolved.has(id))).toEqual([]);
  });

  it('CONT-AC-10 the projects facts sheet has rows P-01..P-12, and an "Open" row is never publishable', () => {
    expect([...projectAnswers.keys()]).toEqual(Array.from({ length: 12 }, (_, i) => `P-${String(i + 1).padStart(2, '0')}`));
    expect(publishable('P-99')).toBe(false);
  });
});

describe('row references in src/content/*.ts', () => {
  it('CONT-AC-10 every data line carries a // F-xx, C-xx, RQ-xx, CMP-xx or spec AC reference', () => {
    const data = sourceLines.filter((l) => isDataLine(l.code));
    expect(data.length).toBeGreaterThan(80);
    // CMP-xx (compliance requirement) is a valid source only in privacy.ts (U-10 review #7).
    const ref = (file: string) =>
      file === 'privacy.ts' ? /\b([FC]-\d{2}|RQ-\d{2}|CMP-\d{2}|[A-Z]+-AC-\d{2})\b/ : /\b([FCP]-\d{2}|RQ-\d{2}|[A-Z]+-AC-\d{2})\b/;
    const missing = data.filter((l) => !ref(l.file).test(l.comment));
    expect(missing.map((l) => `${l.file}:${l.n} ${l.code.trim()}`)).toEqual([]);
  });

  it('CONT-AC-10 CMP-xx references appear only in privacy.ts, so other facts keep their F/C/RQ trace', () => {
    const outside = sourceLines.filter((l) => l.file !== 'privacy.ts' && /\bCMP-\d{2}\b/.test(l.comment));
    expect(outside.map((l) => `${l.file}:${l.n}`)).toEqual([]);
  });

  it('CONT-AC-10 every referenced row exists and is publishable (confirm/edit, or resolved and not withheld)', () => {
    const refs = sourceLines.flatMap((l) => (l.comment.match(ROW_ID) ?? []).map((id) => ({ id, at: `${l.file}:${l.n}` })));
    expect(refs.length).toBeGreaterThan(80);
    const bad = refs.filter((r) => !publishable(r.id)).map((r) => `${r.at} ${r.id} (${answers.get(r.id) ?? 'unknown row'})`);
    expect(bad).toEqual([]);
  });

  it('CONT-AC-10 every referenced RQ-xx decision exists in 1.1-requirements.md', () => {
    const rqs = sourceLines.flatMap((l) => l.comment.match(/\bRQ-\d{2}\b/g) ?? []);
    expect(rqs.length).toBeGreaterThan(0);
    expect(rqs.filter((rq) => !REQUIREMENTS.includes(`**${rq} `))).toEqual([]);
  });

  it('CONT-AC-10 HOME-AC-28 every referenced CMP-xx requirement exists in compliance.md', () => {
    const cmps = sourceLines.flatMap((l) => l.comment.match(/\bCMP-\d{2}\b/g) ?? []);
    expect(cmps.length).toBeGreaterThan(0);
    expect(cmps.filter((c) => !COMPLIANCE.includes(`| ${c} |`))).toEqual([]);
  });

  it('CONT-AC-10 every referenced spec AC exists in specs/*.md (UI copy the spec fixes verbatim)', () => {
    const specs = fs.readdirSync(path.join(repo, 'specs')).filter((f) => f.endsWith('.md')).map((f) => read(`specs/${f}`)).join('\n');
    const acs = sourceLines.flatMap((l) => l.comment.match(/\b[A-Z]+-AC-\d{2}\b/g) ?? []);
    expect(acs.filter((ac) => !specs.includes(`**${ac}**`))).toEqual([]);
  });

  it('CONT-AC-10 a value backed only by a spec AC appears verbatim in that AC (U-06 review #4)', () => {
    const specs = fs.readdirSync(path.join(repo, 'specs')).filter((f) => f.endsWith('.md')).map((f) => read(`specs/${f}`)).join('\n');
    const acText = (ac: string) => specs.split('\n').find((l) => l.includes(`**${ac}**`)) ?? '';
    const acOnly = sourceLines.filter((l) => /\b[A-Z]+-AC-\d{2}\b/.test(l.comment) && !/\b([FCP]-\d{2}|RQ-\d{2}|CMP-\d{2})\b/.test(l.comment));
    expect(acOnly.length).toBeGreaterThan(0);
    const bad = acOnly.flatMap((l) => {
      const value = l.code.match(/['"`]([^'"`]+)['"`]/)?.[1] ?? '';
      const acs = l.comment.match(/\b[A-Z]+-AC-\d{2}\b/g) ?? [];
      return acs.some((ac) => value && acText(ac).includes(value)) ? [] : [`${l.file}:${l.n} "${value}" not in ${acs.join(', ')}`];
    });
    expect(bad).toEqual([]);
  });
});

describe('owner resolutions (1.1-facts-resolved.md)', () => {
  const all = JSON.stringify({ profile, experience, work, posts });

  it('CONT-AC-10 F-05: the hero says relocating to the UK or EU', () => {
    expect(profile.relocation.summary).toBe('Relocating to the UK or EU');
  });

  it('CONT-AC-10 F-08/C-17: no "regulated software" claim; the hero and meta description follow F-08', () => {
    expect(all).not.toMatch(/regulated software/i);
    expect(profile.hero.intro).toContain('Nine years shipping production software, including nearly three at bet365 in Manchester.');
    expect(profile.seo.description).toMatch(/Nine years shipping production software/);
    expect(profile.seo.description.length).toBeLessThanOrEqual(160);
    expect(profile.seo.title.length).toBeLessThan(60);
  });

  it('CONT-AC-10 F-13/F-43: no "LLM-powered" wording; the 10-languages bullet follows the resolution', () => {
    expect(all).not.toMatch(/LLM-powered/i);
    const bet365 = experience.find((e) => e.id === 'bet365');
    expect(bet365?.kind === 'job' && bet365.bullets).toContain(
      'Built a VS Code tool that generated translations across 10 languages plus UK, US and Australian English.',
    );
    expect(profile.highlights.map((h) => h.value)).toContain('10 languages');
  });

  it('CONT-AC-10 PROJ-AC-13 P-01..P-09: PromptShield is now Sluice, in progress with no target, metric null, case study and demo env', () => {
    const sluice = work.find((w) => w.slug === 'sluice');
    expect(sluice).toMatchObject({
      name: 'Sluice',
      formerName: 'PromptShield',
      subtitle: 'Guardrail gateway for AI agents',
      status: 'in-progress',
      metric: null,
      playOriginEnv: 'SLUICE_ORIGIN',
      wasm: true,
      caseStudy: true,
    });
    expect(sluice).not.toHaveProperty('target');
    expect(sluice).not.toHaveProperty('badgeLabel');
    expect(sluice).not.toHaveProperty('repoUrl'); // P-07: the repo is private
    expect(work.find((w) => w.slug === 'promptshield')).toBeUndefined();
  });

  it('CONT-AC-10 F-20..F-29: fde-cloud-spine and fde-mcp-gateway are planned with target 2026-12', () => {
    for (const slug of ['fde-cloud-spine', 'fde-mcp-gateway']) {
      expect(work.find((w) => w.slug === slug)).toMatchObject({ status: 'planned', target: '2026-12' });
    }
  });

  it('CONT-AC-10 F-34/F-35: the Opteamix entry has the confirmed bullet and the two owner-supplied bullets (2026-11-25)', () => {
    const op = experience.find((e) => e.id === 'opteamix');
    expect(op?.kind === 'job' && op.bullets).toEqual([
      'Joined as a contractor; converted to full-time in October 2026.',
      'Worked on an offline field-inspection app for Dell rugged tablets: photo capture and offline sync as a PWA, hosted in .NET WebView2.',
      'Used Capacitor for native Android and iOS features, with a SQLite database for time and attendance: site check-in and check-out, clock-in and clock-out.',
      'Managed the team and developed an AI-assisted SDLC; coached developers to become proficient in spec-based development.',
      'Introduced Jira hygiene, RCA tracking and estimation for a new module.',
      'Received an Innovator Award from the CEO.',
    ]);
  });

  it('CONT-AC-10 F-38: the bet365 title is Software Developer', () => {
    expect(experience.find((e) => e.id === 'bet365')).toMatchObject({ title: 'Software Developer' });
  });

  it('CONT-AC-10 F-63/F-72: notice period and availability are null; there is no CV URL', () => {
    expect(profile.noticePeriod).toBeNull();
    expect(profile.availability).toBeNull();
    expect(all).not.toMatch(/cvUrl|\.pdf/i);
  });

  it('CONT-AC-10 F-66: there is no footer tagline', () => {
    expect(all).not.toMatch(/Built with React, TypeScript and Go/);
    expect(Object.keys(profile)).not.toContain('footerTagline');
  });

  it('CONT-AC-10 F-67/F-68/F-69: LinkedIn, GitHub and the site origin match the owner answers', () => {
    expect(profile.links).toEqual({
      linkedin: 'https://www.linkedin.com/in/tijo-j-thomaz93/',
      github: 'https://github.com/tijo-thomaz',
    });
    expect(profile.siteUrl).toBe('https://tijothomas.dev');
  });

  it('CONT-AC-10 F-71/RQ-04: no work item or post has a link yet', () => {
    const linked = [...work.filter((w) => w.caseStudyUrl).map((w) => w.slug), ...posts.filter((p) => p.url).map((p) => p.slug)];
    expect(linked).toEqual([]);
  });

  it('CONT-AC-10 F-58..F-60/RQ-01: the three posts are "coming-soon"', () => {
    expect(posts.map((p) => p.status)).toEqual(['coming-soon', 'coming-soon', 'coming-soon']);
  });
});

describe('owner edits at PG5 U-05 (2026-11-24)', () => {
  it('CONT-AC-10 C-04: the city signposts are the timeline locations, newest first', () => {
    expect(profile.city.signposts).toEqual(['Bengaluru', 'Manchester', 'Trivandrum', 'Mumbai']);
    const cities = experience.flatMap((e) => (e.kind === 'job' ? [e.location.split(',')[0]] : []));
    expect(cities.filter((c, i) => cities.indexOf(c) === i)).toEqual([...profile.city.signposts]);
  });

  it('CONT-AC-10 F-55: Speridian is in Mumbai, India', () => {
    expect(experience.find((e) => e.id === 'speridian')).toMatchObject({ location: 'Mumbai, India' });
  });
});
