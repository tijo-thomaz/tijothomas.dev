import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    // Mirrors tsconfig "paths": { "@/*": ["./src/*"] } (Vite does not read tsconfig paths).
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/{app,components,terminal,content,lib}/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/.next/**', '.claude/**'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/{app,components,terminal,content,lib}/**/*.{ts,tsx}'],
      exclude: ['**/*.test.{ts,tsx}', '**/node_modules/**', '**/.next/**', '.claude/**'],
    },
  },
});
