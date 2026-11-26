// SEO-AC-09 (U-07): the strings `/` must hold in its server HTML, built from src/content (not a
// hand-kept list). Each expected string is one whole rendered text node. Formatted strings (date
// ranges, badges with a target month, "·" joins) come from src/lib/format.ts, the module the
// components use (U-07 review #2). forbiddenStrings lists planned items that must be absent while
// SHOW_PLANNED is off (review #3).
// Node strips TypeScript types when importing the content and lib modules. That works because
// content imports types only (PLAT-AC-09, enforced by check-imports) and the lib modules loaded here
// have no value imports. A value import with an `@/` alias would break this loader, and the
// content-strings test would fail.
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { paths } from '../paths.mjs';
import { repoRoot } from './test-utils.mjs';

const when = (cond, ...values) => (cond ? values : []);

async function loadAll(root) {
  const load = (layer, file) => import(pathToFileURL(path.join(root, layer, file)).href);
  const { content, lib } = paths.layers;
  const [{ profile }, { work }, { experience }, { posts }, { visible }, { isShowPlanned }, format, { playLinks }] = await Promise.all([
    load(content, 'profile.ts'), load(content, 'work.ts'), load(content, 'experience.ts'), load(content, 'posts.ts'),
    load(lib, 'visible.ts'), load(lib, 'flags.ts'), load(lib, 'format.ts'), load(lib, 'projects.ts'),
  ]);
  return { profile, work, experience, posts, visible, isShowPlanned, format, play: playLinks(work, process.env) };
}

function profileStrings(profile) {
  const { labels, sections, hero, relocation } = profile;
  const line = [profile.location, relocation.summary, ...when(relocation.visaSponsorshipRequired, relocation.visaLabel)];
  return [
    profile.headline, line.join(' · '), hero.intro, hero.primaryCta.label, hero.secondaryCta.label, hero.tip,
    profile.nav.brand, ...profile.nav.items.map((i) => i.label), labels.skipLink,
    ...profile.highlights.flatMap((h) => [h.value, h.label]),
    sections.work.title, sections.work.intro, sections.experience.title, sections.experience.intro,
    sections.howIWork.title, ...profile.howIWork.flatMap((s) => [s.title, s.text]),
    sections.writing.title, sections.writing.intro,
    sections.contact.title, sections.contact.intro, labels.linkedin, labels.github,
    ...when(profile.availability, labels.availability, profile.availability),
    labels.terminalMode, profile.name,
    ...profile.city.signposts, // CityMap sign boards (U-08)
  ];
}

function workStrings(items, { labels, sections }, { workBadge }, play) {
  if (items.length === 0) return [sections.work.empty];
  return items.flatMap((w) => [
    w.name, w.subtitle, ...when(w.formerName, `${labels.formerly} ${w.formerName}`), w.summary, w.stack.join(' · '), workBadge(w, labels.workStatus),
    ...when(w.metric, w.metric?.label, w.metric?.value ?? labels.notMeasured),
    ...when(w.caseStudy || w.caseStudyUrl, labels.caseStudy), // PROJ-AC-10
    ...when(play[w.slug], labels.play),
  ]);
}

function experienceStrings(entries, { labels }, { formatRange }) {
  return entries.flatMap((e) => [
    formatRange(e.start, e.end, labels.present),
    ...(e.kind === 'gap'
      ? [e.label, e.tile]
      : [e.company, e.title, [e.location, e.workMode].filter(Boolean).join(' · '), e.monogram, ...e.bullets]),
    ...when(e.end === null, labels.now),
  ]);
}

function postStrings(items, { labels, sections }) {
  if (items.length === 0) return [sections.writing.empty];
  return items.flatMap((p) => [p.title, p.subtitle, ...when(p.status !== 'published', labels.postStatus[p.status])]);
}

/** Every whole text node `/` renders. showPlanned defaults to the page's own rule on env. */
export async function expectedStrings({ root = repoRoot, showPlanned } = {}) {
  const m = await loadAll(root);
  const show = showPlanned ?? m.isShowPlanned(process.env.SHOW_PLANNED);
  return [...new Set([
    ...profileStrings(m.profile),
    ...workStrings(m.visible(m.work, show), m.profile, m.format, m.play),
    ...experienceStrings(m.experience, m.profile, m.format),
    ...postStrings(m.visible(m.posts, show), m.profile),
  ])];
}

/** Planned work and post titles and summaries, which must be absent while SHOW_PLANNED is off. */
export async function forbiddenStrings({ root = repoRoot, showPlanned } = {}) {
  const m = await loadAll(root);
  if (showPlanned ?? m.isShowPlanned(process.env.SHOW_PLANNED)) return [];
  return [
    ...m.work.filter((w) => w.status === 'planned').flatMap((w) => [w.name, w.summary]),
    ...m.posts.filter((p) => p.status === 'planned').flatMap((p) => [p.title]),
  ];
}
