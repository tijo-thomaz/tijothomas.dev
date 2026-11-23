import type { Metadata } from 'next';

import { siteUrl } from '@/lib/site';
import TerminalApp from '@/terminal/page';

// TERM-AC-03: /terminal is a legacy view, so it stays out of the index but its links are followed.
// Page metadata replaces the layout's `robots` (Next merges metadata shallowly, page wins).
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  robots: { index: false, follow: true },
  alternates: { canonical: '/terminal' },
};

export default function TerminalPage() {
  return <TerminalApp />;
}
