// U-03: the /api route entries re-export the unchanged handlers moved to src/terminal/api, so the
// endpoints keep their behaviour while the legacy-terminal override stays exactly src/terminal/**.
import { beforeAll, describe, expect, it, vi } from 'vitest';

beforeAll(() => {
  // The terminal Supabase client is created at module load (lazy from U-02).
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'x');
});

describe('/api route entries', () => {
  it('U-03 /api/analytics exports the terminal GET and POST handlers', async () => {
    const entry = await import('./analytics/route');
    const impl = await import('../../terminal/api/analytics/route');
    expect(entry.GET).toBe(impl.GET);
    expect(entry.POST).toBe(impl.POST);
  });

  it('U-03 /api/chat exports the terminal GET and POST handlers', async () => {
    const entry = await import('./chat/route');
    const impl = await import('../../terminal/api/chat/route');
    expect(entry.GET).toBe(impl.GET);
    expect(entry.POST).toBe(impl.POST);
  });
});
