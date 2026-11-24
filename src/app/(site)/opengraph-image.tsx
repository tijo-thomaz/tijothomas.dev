import { ImageResponse } from 'next/og';

import { profile } from '@/content/profile';

// SEO-AC-02, C-18: the share image for `/`: the confirmed name and headline, 1200x630 PNG, built
// at build time. It uses next/og's bundled default font, so the build makes no network fetch
// (T-56, R8). That font has the "·" and "–" glyphs.
export const alt = profile.headline;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const INK = '#0f1b2d';
const MINT = '#e6f5ec';
const ACCENT = '#ff7a33';
const GREEN = '#1f5c3f';

export default function OpengraphImage() {
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
        }}
      >
        <div style={{ width: 96, height: 12, borderRadius: 6, background: ACCENT, marginBottom: 40 }} />
        <div style={{ fontSize: 44, fontWeight: 700, color: GREEN }}>{profile.name}</div>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, marginTop: 20, maxWidth: 980 }}>
          {profile.headline}
        </div>
      </div>
    ),
    size,
  );
}
