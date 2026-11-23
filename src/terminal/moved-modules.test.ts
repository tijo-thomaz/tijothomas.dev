/// <reference types="vite/client" />
// U-03 (PLAT-AC-10 companion): every module moved into src/terminal still loads after the import
// paths were rewritten to `@/terminal/...`. A wrong path fails here, not only in the e2e build.
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

// next/font exists only under Next's SWC transform (boundary double, same shape as Next's output).
vi.mock('next/font/google', () => ({
  JetBrains_Mono: () => ({ className: 'font-jetbrains-mono', variable: '--font-mono', style: { fontFamily: 'JetBrains Mono' } }),
}));

// The Supabase client is created at module load and throws on an empty URL (U-02 makes it lazy).
beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'x');
});
afterAll(() => vi.unstubAllEnvs());

const modules = import.meta.glob(['./**/*.{ts,tsx}', '!./**/*.test.{ts,tsx}']);

describe('src/terminal after the move', () => {
  it('U-03 finds the moved terminal modules', () => {
    expect(Object.keys(modules).length).toBeGreaterThan(80);
  });

  it.each(Object.keys(modules))('U-03 %s loads and its imports resolve', async (file) => {
    const mod = await modules[file]();
    expect(mod).toBeTypeOf('object');
  });
});
