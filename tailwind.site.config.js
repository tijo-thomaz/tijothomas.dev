/**
 * Tailwind config for the public site only (`src/app/(site)/globals.css` points here via @config).
 * `content` covers the site layers and never the terminal, so `/` ships no terminal utilities.
 * The site is styled with plain CSS tokens in globals.css. Tailwind provides only the preflight reset
 * and any utilities the site layers really use. (U-07; U-03 review finding.)
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: [
    './src/app/(site)/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/content/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  theme: { extend: {} },
  plugins: [],
};
