// Security headers (U-11, ADR-P1, edd-docs/inception/threat-model.md §6) are static edge headers, so
// `/` stays a prerendered static page (no nonce, no per-request code).
// Rule order matters: Next applies the LATER rule when two rules set the same key on one path. The
// baseline comes first for every path; the strict site CSP comes after it for the site routes only.

// Projects platform (U-14): the registry is src/content/work.ts. Node 24 (package.json engines, so
// Vercel builds on 24.x too) strips the TypeScript types on require; both modules have type-only
// imports. Kept as next.config.js, not .ts: the U-11 header tests load it with require (plan deviation).
const { work } = require('./src/content/work.ts');
const { formerRedirects, playHeaderRules, playRewrites, registryProblems } = require('./src/lib/projects.ts');

const problems = registryProblems(work);
if (problems.length > 0) throw new Error(`work registry: ${problems.join('; ')}`);

const isDev = process.env.NODE_ENV === 'development';
// The env as the config was loaded (once per build): demo origins such as SLUICE_ORIGIN.
const buildEnv = { ...process.env };

// §6.1 Baseline: every response, including /terminal, /api/* and 404s. Its CSP restricts no scripts,
// styles or connections, so the terminal behaves exactly as before (RQ-11 a). No HSTS preload (SQ-03 a).
const baseline = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; object-src 'none'; base-uri 'none'" },
];

// §6.2 Site CSP. 'unsafe-inline' scripts are needed for Next's inline RSC flight data on a static page
// (§6.3). Vercel Analytics loads from the first-party path /_vercel/insights, so 'self' covers it.
// Development only: 'unsafe-eval' (React dev overlay) and the analytics debug script host.
const siteCsp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval' https://va.vercel-scripts.com" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const SITE_SOURCES = [
  '/',
  '/privacy',
  '/projects',
  '/work/:path*',
  '/writing/:path*',
  // Next serves the OG image at /opengraph-image-<hash> for a route group; `:suffix*` without a prefix
  // is invalid path-to-regexp and fails `next build` (U-11 review #1).
  '/opengraph-image{-:suffix}?',
  '/sitemap.xml',
  '/robots.txt',
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // TERM-AC-04 (SEC-12): the old /v2 entry is a permanent (308) redirect to the terminal.
  // PROJ-AC-06: a project's former slug redirects permanently to its current page.
  async redirects() {
    return [{ source: '/v2', destination: '/terminal', permanent: true }, ...formerRedirects(work)];
  },
  // PROJ-AC-03, PROJ-AC-04: /play/<slug> is served from the project's own deployment when its origin
  // env var (e.g. SLUICE_ORIGIN) is set; otherwise the in-site "Demo coming soon" page answers.
  async rewrites() {
    return { beforeFiles: playRewrites(work, buildEnv), afterFiles: [], fallback: [] };
  },
  async headers() {
    return [
      { source: '/:path*', headers: baseline },
      ...SITE_SOURCES.map((source) => ({
        source,
        headers: [{ key: 'Content-Security-Policy', value: siteCsp }],
      })),
      // PROJ-AC-11, PROJ-AC-12: after the baseline, so the /play CSP and noindex win on /play/*.
      ...playHeaderRules(work, buildEnv, siteCsp),
    ];
  },
};

module.exports = nextConfig;
