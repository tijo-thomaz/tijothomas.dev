import './globals.css';

import { Analytics } from '@vercel/analytics/react';
import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';

import { profile } from '@/content/profile';
import { siteUrl } from '@/lib/site';

// Root layout of the (site) route group. Its own <html> root: no ThemeProvider, no terminal CSS
// and no hidden SEO block, so nothing from /terminal leaks into the public pages (HOME-AC-05).
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // Pages set their own title; sub-pages (e.g. the /work and /writing placeholders) get the name suffix.
  title: { default: profile.name, template: `%s · ${profile.name}` },
  icons: { icon: '/favicon.svg' }, // U-03 review finding, carried to U-09
};

// SEO-AC-03: zoom stays enabled (no maximumScale, no userScalable: false).
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function SiteRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
