import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    // Mirrors tsconfig "paths": { "@/*": ["./*"] } (Vite does not read tsconfig paths).
    alias: {
      '@': path.resolve(dirname, '.'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: [
      '{app,components,terminal,content,lib}/**/*.test.{ts,tsx}',
      // Temporary until U-03 moves these trees into terminal/ (PLAT-AC-08).
      '{features,widgets,shared}/**/*.test.{ts,tsx}',
    ],
    exclude: ['**/node_modules/**', '**/.next/**', '.claude/**'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: [
        '{app,components,terminal,content,lib}/**/*.{ts,tsx}',
        '{features,widgets,shared}/**/*.{ts,tsx}',
      ],
      exclude: ['**/*.test.{ts,tsx}', '**/node_modules/**', '**/.next/**', '.claude/**'],
    },
  },
});
