// U-14: /play/[slug] in-site page, served while the project's demo origin env var is unset (PROJ-AC-05).
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { PlayFallback } from '@/components/PlayFallback';
import { profile } from '@/content/profile';
import { work } from '@/content/work';
import { siteUrl } from '@/lib/site';

import * as playPage from './[slug]/page';

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

describe('/play/[slug]', () => {
  it('PROJ-AC-05 pre-renders one page per registry item with a demo env name; other slugs 404', async () => {
    expect(await playPage.generateStaticParams()).toEqual(work.filter((w) => w.playOriginEnv).map((w) => ({ slug: w.slug })));
    expect(playPage.dynamicParams).toBe(false);
    expect(await playPage.generateMetadata(params('does-not-exist'))).toEqual({});
    await expect(playPage.default(params('does-not-exist'))).rejects.toThrow(/NEXT_HTTP_ERROR_FALLBACK;404|NEXT_NOT_FOUND|not.?found/i);
  });

  it('PROJ-AC-05 PROJ-AC-11 /play/sluice is noindex (follow) with a canonical on its own URL', async () => {
    const meta = await playPage.generateMetadata(params('sluice'));
    expect(meta.robots).toEqual({ index: false, follow: true });
    expect(meta.alternates?.canonical).toBe(`${siteUrl}/play/sluice`);
  });

  it('PROJ-AC-05 /play/sluice has one h1, "Demo coming soon" and a link to /work/sluice', async () => {
    const html = renderToStaticMarkup(await playPage.default(params('sluice')));
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain('>Sluice</h1>');
    expect(html).toContain('Demo coming soon');
    expect(html).toContain('href="/work/sluice"');
    expect(html).toContain('href="/"');
  });

  it('PROJ-AC-05 no repo link while repoUrl is unset (P-07: the repo is private)', async () => {
    const html = renderToStaticMarkup(await playPage.default(params('sluice')));
    expect(html).not.toContain('github.com');
    expect(html).not.toContain(`>${profile.labels.github}</a>`);
  });

  it('PROJ-AC-05 with repoUrl set, the page links to the repo in a new context with noopener noreferrer', async () => {
    // A neutral fixture host: the RCA-01 guard allows only the F-68 account on github.com.
    const html = renderToStaticMarkup(<PlayFallback item={{ ...work[0], repoUrl: 'https://code.example.com/example/repo' }} profile={profile} />);
    expect(html).toContain('href="https://code.example.com/example/repo"');
    expect(html).toMatch(/rel="noopener noreferrer"/);
  });
});
