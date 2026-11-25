// U-02 scope 3: /api/analytics calls the lazy getter. With no Supabase env it is a safe no-op
// (never 500, no console.error); with env it still uses the client (regression).
// Boundary mock: @supabase/supabase-js (vi.doMock). Fixed clock for the rpc date argument.
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const URL_KEY = 'NEXT_PUBLIC_SUPABASE_URL';
const ANON_KEY = 'NEXT_PUBLIC_SUPABASE_ANON_KEY';
const saved = { url: process.env[URL_KEY], key: process.env[ANON_KEY] };

function setEnv(url?: string, key?: string) {
  if (url === undefined) delete process.env[URL_KEY]; else process.env[URL_KEY] = url;
  if (key === undefined) delete process.env[ANON_KEY]; else process.env[ANON_KEY] = key;
}

const post = (body: unknown) =>
  new NextRequest('http://localhost/api/analytics', { method: 'POST', body: JSON.stringify(body) });

function rows(data: unknown[]) {
  return { select: () => ({ order: () => ({ limit: async () => ({ data, error: null }) }) }) };
}

function mockSdk() {
  const rpc = vi.fn(async () => ({ error: null }));
  const from = vi.fn((table: string) =>
    table === 'daily_visits'
      ? rows([{ visit_count: 2 }, { visit_count: 3 }])
      : rows([{ commands_used: 4, ai_questions: 1 }]));
  const createClient = vi.fn(() => ({ from, rpc }));
  vi.doMock('@supabase/supabase-js', () => ({ createClient }));
  return { createClient, from, rpc };
}

let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.resetModules();
  setEnv(undefined, undefined);
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-24T10:00:00.000Z'));
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.doUnmock('@supabase/supabase-js');
  vi.useRealTimers();
  vi.restoreAllMocks();
  setEnv(saved.url, saved.key);
});

describe('/api/analytics with no Supabase env (TERM-AC-06)', () => {
  it('TERM-AC-06 the route module imports with no env (real SDK, no "supabaseUrl is required")', async () => {
    await expect(import('./route')).resolves.toHaveProperty('GET');
  });

  it('TERM-AC-06 GET returns 200 with empty visits and usage, not 500, and logs no error', async () => {
    const { createClient } = mockSdk();
    const { GET } = await import('./route');
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ visits: [], usage: [] });
    expect(consoleError).not.toHaveBeenCalled();
    expect(createClient).not.toHaveBeenCalled();
  });

  it.each(['visit', 'command', 'question', 'unknown'])(
    'TERM-AC-06 POST {type: %s} is a no-op: 200 JSON with a boolean success, no rpc, no error log',
    async (type) => {
      const { createClient, rpc } = mockSdk();
      const { POST } = await import('./route');
      const res = await POST(post({ type }));
      expect(res.status).toBe(200);
      expect(typeof (await res.json()).success).toBe('boolean');
      expect(rpc).not.toHaveBeenCalled();
      expect(createClient).not.toHaveBeenCalled();
      expect(consoleError).not.toHaveBeenCalled();
    },
  );
});

describe('/api/analytics with Supabase env (regression through the lazy getter)', () => {
  beforeEach(() => setEnv('https://example.supabase.co', 'anon'));

  it('TERM-AC-06 importing the route does not create the client; the first request does', async () => {
    const { createClient } = mockSdk();
    const { GET } = await import('./route');
    expect(createClient).not.toHaveBeenCalled();
    await GET();
    expect(createClient).toHaveBeenCalledTimes(1);
  });

  it('TERM-AC-06 GET returns the 30-day rows and totals from the client', async () => {
    mockSdk();
    const { GET } = await import('./route');
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ totalVisits: 5, totalCommands: 4, totalQuestions: 1 });
  });

  it('TERM-AC-06 POST visit calls increment_daily_visits with today (fixed clock) and returns success true', async () => {
    const { rpc } = mockSdk();
    const { POST } = await import('./route');
    const res = await POST(post({ type: 'visit' }));
    expect(await res.json()).toEqual({ success: true });
    expect(rpc).toHaveBeenCalledWith('increment_daily_visits', { input_date: '2026-11-24' });
  });
});
