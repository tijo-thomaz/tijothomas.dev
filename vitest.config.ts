import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';


const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'features/**/*.test.{ts,tsx}',
      'widgets/**/*.test.{ts,tsx}',
      'shared/**/*.test.{ts,tsx}',
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: [
        'features/**/*.{ts,tsx}',
        'widgets/**/*.{ts,tsx}',
        'shared/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/*.stories.{ts,tsx}',
        '**/*.test.{ts,tsx}',
        '**/node_modules/**',
        '**/.next/**',
      ],
    },
  },
});
