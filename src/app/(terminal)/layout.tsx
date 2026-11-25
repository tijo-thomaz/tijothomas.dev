// Root layout of the (terminal) route group: the legacy terminal layout (ThemeProvider, JetBrains
// Mono, terminal CSS, hidden SEO block, terminal viewport), unchanged in src/terminal/layout.tsx.
// Its own <html> root keeps terminal styles and theme state out of the (site) group (bulkhead).
import TerminalRootLayout, { metadata as terminalMetadata, viewport as terminalViewport } from '@/terminal/layout';

export const metadata = terminalMetadata;
export const viewport = terminalViewport;

export default TerminalRootLayout;
