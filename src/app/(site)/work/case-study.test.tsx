// U-15: /work/[slug] serves the case studies (PROJ-AC-08, PROJ-AC-09, PROJ-AC-13, PROJ-AC-16, SEO-AC-07).
import { render, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { sluiceCaseStudy as cs } from '@/content/case-studies/sluice';
import { profile } from '@/content/profile';
import { siteUrl } from '@/lib/site';

import * as page from './[slug]/page';

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });
const renderPage = async (slug = 'sluice') => render(await page.default(params(slug))).container;
const section = (root: HTMLElement, heading: string) => {
  const h2 = Array.from(root.querySelectorAll('h2')).find((h) => h.textContent === heading);
  return h2?.closest('section') ?? null;
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('/work/[slug] routing', () => {
  it('SEO-AC-07 PROJ-AC-08 pre-renders only the visible case studies; other slugs 404 (dynamicParams = false)', async () => {
    expect(await page.generateStaticParams()).toEqual([{ slug: 'sluice' }]);
    expect(page.dynamicParams).toBe(false);
    for (const bad of ['does-not-exist', 'fde-mcp-gateway', 'promptshield']) {
      expect(await page.generateMetadata(params(bad))).toEqual({});
      await expect(page.default(params(bad))).rejects.toThrow(/NEXT_HTTP_ERROR_FALLBACK;404|NEXT_NOT_FOUND|not.?found/i);
    }
  });

  it('PROJ-AC-16 /work/sluice is indexable, with its own title, the case-study description and a canonical', async () => {
    const meta = await page.generateMetadata(params('sluice'));
    expect(meta.title).toBe('Sluice');
    expect(meta.description).toBe(cs.description);
    expect(meta.robots).toBeUndefined();
    expect(meta.alternates?.canonical).toBe(`${siteUrl}/work/sluice`);
  });
});

describe('/work/sluice content', () => {
  it('PROJ-AC-08 has one h1 and the sections Problem, Why it matters, Architecture, Evaluation and Trade-offs, in order', async () => {
    const root = await renderPage();
    expect(root.querySelectorAll('h1')).toHaveLength(1);
    expect(root.querySelector('h1')?.textContent).toBe('Sluice');
    expect(Array.from(root.querySelectorAll('h2')).map((h) => h.textContent)).toEqual([
      'Problem', 'Why it matters', 'Architecture', 'Evaluation', 'Trade-offs',
    ]);
  });

  it('PROJ-AC-08 P-11 Evaluation reads "Evaluation in progress", with no % and no table', async () => {
    const evaluation = section(await renderPage(), 'Evaluation');
    expect(evaluation?.textContent).toContain('Evaluation in progress');
    expect(evaluation?.textContent).not.toContain('%');
    expect(evaluation?.querySelector('table')).toBeNull();
  });

  it('PROJ-AC-08 P-10 the target architecture is labelled Planned; both architectures have an SVG diagram with a name', async () => {
    const arch = section(await renderPage(), 'Architecture');
    if (!arch) throw new Error('no Architecture section');
    const target = Array.from(arch.querySelectorAll('h3')).find((h) => h.textContent === cs.architecture.target.heading);
    expect(target?.closest('div')?.textContent).toContain(profile.labels.workStatus.planned);
    const svgs = arch.querySelectorAll('svg[role="img"]');
    expect(svgs).toHaveLength(2);
    for (const svg of Array.from(svgs)) {
      const id = svg.getAttribute('aria-labelledby') ?? '';
      expect(svg.querySelector(`title[id="${id}"]`)?.textContent).toMatch(/\S/);
    }
    for (const node of [...cs.architecture.today.diagram.nodes, ...cs.architecture.target.diagram.nodes]) {
      expect(arch.textContent).toContain(node);
    }
  });

  it('PROJ-AC-09 SEC-11 every source renders as a link with rel noopener noreferrer', async () => {
    const why = section(await renderPage(), 'Why it matters');
    if (!why) throw new Error('no Why it matters section');
    for (const s of cs.whyItMatters.sources) {
      const link = within(why).getByRole('link', { name: s.label });
      expect(link.getAttribute('href')).toBe(s.href);
      expect(link.getAttribute('rel')?.split(' ')).toEqual(expect.arrayContaining(['noopener', 'noreferrer']));
    }
  });

  it('PROJ-AC-13 shows "formerly PromptShield", the status badge and no metric row while metric is null', async () => {
    const root = await renderPage();
    expect(root.textContent).toContain('formerly PromptShield');
    expect(root.textContent).toContain(profile.labels.workStatus['in-progress']);
    expect(root.textContent).not.toContain(profile.labels.notMeasured);
  });

  it('PROJ-AC-07 "Play" links to /play/sluice only when SLUICE_ORIGIN is set', async () => {
    const play = (root: HTMLElement) => Array.from(root.querySelectorAll('a')).filter((a) => a.textContent === profile.labels.play);
    vi.stubEnv('SLUICE_ORIGIN', '');
    expect(play(await renderPage())).toHaveLength(0);
    vi.stubEnv('SLUICE_ORIGIN', 'https://sluice-example.vercel.app');
    const links = play(await renderPage());
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/play/sluice']);
  });

  it('PROJ-AC-08 links home and has no repo link while repoUrl is unset (P-07)', async () => {
    const root = await renderPage();
    expect(root.querySelector('a[href="/"]')).not.toBeNull();
    expect(Array.from(root.querySelectorAll('a')).filter((a) => a.textContent === profile.labels.github)).toHaveLength(0);
  });
});
