/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // Performance optimizations
  // experimental: {
  //   optimizeCss: true, // Disabled due to critters dependency issue
  // },
  // Bundle optimization
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Image optimization
  images: {
    domains: ['images.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // TERM-AC-04 (SEC-12): the old /v2 entry is a permanent (308) redirect to the terminal.
  async redirects() {
    return [{ source: '/v2', destination: '/terminal', permanent: true }];
  },
}

module.exports = withBundleAnalyzer(nextConfig)
