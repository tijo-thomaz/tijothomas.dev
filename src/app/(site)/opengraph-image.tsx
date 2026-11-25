import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

import { profile } from '@/content/profile';

// SEO-AC-02, C-18: the share image for `/`: the confirmed name and headline, 1200x630 PNG, built at
// build time. Bold Space Grotesk (the site's display face) is read from a committed font file
// (@fontsource/space-grotesk 5.3.0, latin 700, SIL OFL 1.1, see fonts/OFL.txt), so the build makes no
// network fetch (T-56, R8). The latin subset covers the ASCII text guarded by the unit test.
export const alt = profile.headline;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const FONT = join(process.cwd(), 'src', 'app', '(site)', 'fonts', 'space-grotesk-latin-700-normal.woff');
const INK = '#0f1b2d';
const MINT = '#e6f5ec';
const ACCENT = '#ff7a33';
const GREEN = '#1f5c3f';

export default async function OpengraphImage() {
  const spaceGrotesk = await readFile(FONT);
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px 88px',
          background: MINT,
          color: INK,
          fontFamily: 'Space Grotesk',
        }}
      >
        <div style={{ width: 96, height: 12, borderRadius: 6, background: ACCENT, marginBottom: 40 }} />
        <div style={{ fontSize: 44, fontWeight: 700, color: GREEN }}>{profile.name}</div>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, marginTop: 20, maxWidth: 980 }}>
          {profile.headline}
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: 'Space Grotesk', data: spaceGrotesk, weight: 700, style: 'normal' }] },
  );
}
