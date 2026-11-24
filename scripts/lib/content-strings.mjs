// SEO-AC-09 (U-07): the strings `/` must hold in its server HTML, built from src/content (not a
// hand-kept list). Node 24 strips the TypeScript types when importing the content modules, which
// import types only (PLAT-AC-09). Planned items count only when showPlanned is true, as on the page.
// Composite strings (dates, "·" joins) are formatted by components; each part is expected on its own.
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { paths } from '../paths.mjs';
import { repoRoot } from './test-utils.mjs';

const load = (layer, file) => import(pathToFileURL(path.join(repoRoot, layer, file)).href);
const when = (cond, ...values) => (cond ? values : []);

function profileStrings(profile) {
  const { labels, sections, hero, relocation } = profile;
  return [
    profile.headline, profile.location, relocation.summary,
    ...when(relocation.visaSponsorshipRequired, relocation.visaLabel),
    hero.intro, hero.primaryCta.label, hero.secondaryCta.label, hero.tip,
    profile.nav.brand, ...profile.nav.items.map((i) => i.label), labels.skipLink,
    ...profile.highlights.flatMap((h) => [h.value, h.label]),
    sections.work.title, sections.work.intro, sections.experience.title, sections.experience.intro,
    sections.howIWork.title, ...profile.howIWork.flatMap((s) => [s.title, s.text]),
    sections.writing.title, sections.writing.intro,
    sections.contact.title, sections.contact.intro, labels.linkedin, labels.github,
    ...when(profile.availability, labels.availability, profile.availability),
    labels.terminalMode, profile.name,
  ];
}

function workStrings(items, { labels, sections }) {
  if (items.length === 0) return [sections.work.empty];
  return items.flatMap((w) => [
    w.name, w.subtitle, w.summary, ...w.stack,
    w.status === 'live' ? (w.badgeLabel ?? labels.workStatus.live) : labels.workStatus[w.status],
    ...when(w.metric, w.metric?.label, w.metric?.value ?? labels.notMeasured),
    ...when(w.caseStudyUrl, labels.caseStudy),
  ]);
}

function experienceStrings(entries, { labels }) {
  return entries.flatMap((e) => [
    ...(e.kind === 'gap' ? [e.label, e.tile] : [e.company, e.title, e.location, ...when(e.workMode, e.workMode), ...e.bullets]),
    ...when(e.end === null, labels.now, labels.present),
  ]);
}

function postStrings(items, { labels, sections }) {
  if (items.length === 0) return [sections.writing.empty];
  return items.flatMap((p) => [p.title, p.subtitle, ...when(p.status !== 'published', labels.postStatus[p.status])]);
}

export async function expectedStrings({ showPlanned }) {
  const { content, lib } = paths.layers;
  const [{ profile }, { work }, { experience }, { posts }, { visible }] = await Promise.all([
    load(content, 'profile.ts'), load(content, 'work.ts'), load(content, 'experience.ts'),
    load(content, 'posts.ts'), load(lib, 'visible.ts'),
  ]);
  return [...new Set([
    ...profileStrings(profile),
    ...workStrings(visible(work, showPlanned), profile),
    ...experienceStrings(experience, profile),
    ...postStrings(visible(posts, showPlanned), profile),
  ])];
}
