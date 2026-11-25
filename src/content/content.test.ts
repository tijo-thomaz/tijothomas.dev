// U-05: shape and safety rules for the typed content modules (src/content/*.ts).
// Compile-time guards use @ts-expect-error: `tsc --noEmit` (CG3) fails if a guard stops erroring.
import { describe, expect, it } from 'vitest';

import { experience } from './experience';
import { posts } from './posts';
import { profile } from './profile';
import type { ExperienceEntry, Post, Profile, WorkItem } from './types';
import { work } from './work';

const WORK_STATUSES = ['live', 'in-progress', 'planned'] as const;
const POST_STATUSES = ['published', 'coming-soon', 'planned'] as const;
const YEAR_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const modules = { profile, experience, work, posts };

type Leaf = { path: string; key: string; value: unknown };
const leaves = (node: unknown, path = '', key = ''): Leaf[] => {
  if (node === null || typeof node !== 'object') return [{ path, key, value: node }];
  return Object.entries(node).flatMap(([k, v]) => leaves(v, `${path}.${k}`, Array.isArray(node) ? key : k));
};
const keysOf = (node: unknown): string[] =>
  node === null || typeof node !== 'object'
    ? []
    : Object.entries(node).flatMap(([k, v]) => [...(Array.isArray(node) ? [] : [k]), ...keysOf(v)]);
const allLeaves = Object.entries(modules).flatMap(([name, m]) => leaves(m, name));
const strings = allLeaves.filter((l): l is Leaf & { value: string } => typeof l.value === 'string');

describe('content shape', () => {
  it('CONT-AC-11 profile.howIWork has exactly 5 steps, each with a title and text', () => {
    expect(profile.howIWork).toHaveLength(5);
    for (const step of profile.howIWork) {
      expect(step.title.trim()).not.toBe('');
      expect(step.text.trim()).not.toBe('');
    }
  });

  it('CONT-AC-11 every experience date is YYYY-MM and start <= end', () => {
    const problems = experience.flatMap((e) => [
      ...(YEAR_MONTH.test(e.start) ? [] : [`${e.id}: start ${e.start}`]),
      ...(e.end === null || YEAR_MONTH.test(e.end) ? [] : [`${e.id}: end ${e.end}`]),
      ...(e.end === null || e.start <= e.end ? [] : [`${e.id}: ${e.start} > ${e.end}`]),
    ]);
    expect(problems).toEqual([]);
  });

  it('CONT-AC-11 experience is newest first and only the first entry is open-ended', () => {
    const starts = experience.map((e) => e.start);
    expect(starts).toEqual([...starts].sort().reverse());
    expect(experience.slice(1).every((e) => e.end !== null)).toBe(true);
  });

  it('CONT-AC-11 every experience entry is a job or a gap, and jobs have a company, title and monogram', () => {
    const problems = experience.filter((e) =>
      e.kind === 'job' ? !(e.company && e.title && e.monogram) : e.kind !== 'gap' || !e.label,
    );
    expect(problems.map((e) => e.id)).toEqual([]);
  });

  it('CONT-AC-11 every work and post status is one of the allowed values', () => {
    const bad = [
      ...work.filter((w) => !(WORK_STATUSES as readonly string[]).includes(w.status)).map((w) => w.slug),
      ...posts.filter((p) => !(POST_STATUSES as readonly string[]).includes(p.status)).map((p) => p.slug),
    ];
    expect(bad).toEqual([]);
  });

  it('CONT-AC-11 work and post slugs are unique and URL-safe', () => {
    for (const list of [work.map((w) => w.slug), posts.map((p) => p.slug), experience.map((e) => e.id)]) {
      expect(new Set(list).size).toBe(list.length);
      for (const s of list) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('CONT-AC-11 a work metric is null or has a label, and its value is a string or null', () => {
    const bad = work.filter(
      (w) => w.metric !== null && (!w.metric.label.trim() || !(w.metric.value === null || typeof w.metric.value === 'string')),
    );
    expect(bad.map((w) => w.slug)).toEqual([]);
  });

  it('CONT-AC-11 the type system rejects unknown status values and a sixth how-I-work step', () => {
    // @ts-expect-error 'live-ish' is not a WorkItem status
    const badWork: WorkItem['status'] = 'live-ish';
    // @ts-expect-error 'draft' is not a Post status
    const badPost: Post['status'] = 'draft';
    // @ts-expect-error 'job-ish' is not an experience kind
    const badKind: ExperienceEntry['kind'] = 'job-ish';
    const step = profile.howIWork[0];
    // @ts-expect-error howIWork is a 5-tuple
    const sixSteps: Profile['howIWork'] = [step, step, step, step, step, step];
    expect([badWork, badPost, badKind, sixSteps.length]).toHaveLength(4);
  });
});

describe('content safety', () => {
  it('CONT-AC-13 every URL-typed field starts with https://', () => {
    const urlLeaves = strings.filter((l) => /url$/i.test(l.key) || l.path.startsWith('profile.links.'));
    expect(urlLeaves.length).toBeGreaterThanOrEqual(3);
    const bad = urlLeaves.filter((l) => !/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(l.value));
    expect(bad.map((l) => `${l.path}: ${l.value}`)).toEqual([]);
  });

  it('CONT-AC-13 every href is an in-page anchor, a site path or an https:// URL', () => {
    const hrefs = strings.filter((l) => l.key === 'href');
    expect(hrefs.length).toBeGreaterThan(0);
    // A site path must not be protocol-relative ("//host" leaves the site) (U-05 review #4).
    const SAFE_HREF = /^(#[a-z][a-z-]*|\/(?!\/)[a-z0-9/-]*|https:\/\/\S+)$/;
    expect(['//evil.example', 'javascript:alert(1)', 'http://x.dev'].filter((h) => SAFE_HREF.test(h))).toEqual([]);
    const bad = hrefs.filter((l) => !SAFE_HREF.test(l.value));
    expect(bad.map((l) => `${l.path}: ${l.value}`)).toEqual([]);
  });

  it('CONT-AC-13 no content string starts with mailto:, tel:, javascript: or data:', () => {
    const bad = strings.filter((l) => /^\s*(mailto|tel|javascript|data):/i.test(l.value));
    expect(bad.map((l) => l.path)).toEqual([]);
  });

  it('CONT-AC-13 the type system rejects a non-https URL', () => {
    // @ts-expect-error links.linkedin must be an https:// URL
    const bad: Profile['links']['linkedin'] = 'http://example.com';
    expect(bad).toBeTruthy();
  });

  it('CONT-AC-15 profile has no email, phone or whatsapp key at any depth', () => {
    const banned = keysOf(profile).filter((k) => /^(e-?mail|phone|whatsapp|tel|mobile)/i.test(k));
    expect(banned).toEqual([]);
  });

  it('CONT-AC-15 no content string holds an email address, a +44/+91 number, wa.me or mailto:', () => {
    const bad = strings.filter((l) =>
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|\+(44|91)[\s\d]{6,}|wa\.me|mailto:/i.test(l.value),
    );
    expect(bad.map((l) => `${l.path}: ${l.value}`)).toEqual([]);
  });

  it('CONT-AC-15 the Profile type rejects email, phone and whatsapp keys', () => {
    // @ts-expect-error Profile has no email field (ADR-P5)
    const withEmail: Profile = { ...profile, email: 'x' };
    // @ts-expect-error Profile has no phone field (ADR-P5)
    const withPhone: Profile = { ...profile, phone: 'x' };
    // @ts-expect-error Profile has no whatsapp field (ADR-P5)
    const withWhatsapp: Profile = { ...profile, whatsapp: 'x' };
    expect([withEmail, withPhone, withWhatsapp]).toHaveLength(3);
  });

  it('CONT-AC-10 no content string is a mockup placeholder token, an empty string or "undefined"/"null"', () => {
    const bad = strings.filter((l) => /\[[A-Z][A-Z :]+|^\s*$|^(undefined|null)$/.test(l.value));
    expect(bad.map((l) => `${l.path}: ${JSON.stringify(l.value)}`)).toEqual([]);
  });
});
