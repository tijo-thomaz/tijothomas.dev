/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // TERM-AC-04 (SEC-12): the old /v2 entry is a permanent (308) redirect to the terminal.
  async redirects() {
    return [{ source: '/v2', destination: '/terminal', permanent: true }];
  },
};

module.exports = nextConfig;
