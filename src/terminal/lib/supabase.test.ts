// U-02 scope 3 / F-07: the terminal Supabase client is lazy and guarded (TERM-AC-06, PLAT-AC-03).
// Interface: getSupabase(): SupabaseClient | null (server only; null when env is missing).
// The Supabase SDK is the architectural boundary: it is mocked with vi.doMock only where a test
// needs to count client creation; the "no env" import test uses the real SDK, which throws
// "supabaseUrl is required" on an empty URL (the F-07 build failure).
import type { SupabaseClient } from '@supabase/supabase-js';
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';

const URL_KEY = 'NEXT_PUBLIC_SUPABASE_URL';
const ANON_KEY = 'NEXT_PUBLIC_SUPABASE_ANON_KEY';
const saved = { url: process.env[URL_KEY], key: process.env[ANON_KEY] };

function setEnv(url?: string, key?: string) {
  if (url === undefined) delete process.env[URL_KEY]; else process.env[URL_KEY] = url;
  if (key === undefined) delete process.env[ANON_KEY]; else process.env[ANON_KEY] = key;
}

function mockSdk() {
  const client = { from: vi.fn(), rpc: vi.fn() };
  const createClient = vi.fn(() => client);
  vi.doMock('@supabase/supabase-js', () => ({ createClient }));
  return { client, createClient };
}

const load = () => import('./supabase');

beforeEach(() => {
  vi.resetModules();
  setEnv(undefined, undefined);
});

afterEach(() => {
  vi.doUnmock('@supabase/supabase-js');
  vi.restoreAllMocks();
  setEnv(saved.url, saved.key);
});

describe('lazy Supabase client (U-02)', () => {
  it('TERM-AC-06 PLAT-AC-03 importing the module with no Supabase env does not throw (real SDK)', async () => {
    await expect(load()).resolves.toBeDefined();
  });

  it('TERM-AC-06 getSupabase() returns null when both env vars are missing', async () => {
    const { createClient } = mockSdk();
    const mod = await load();
    expect(typeof mod.getSupabase).toBe('function');
    expect(mod.getSupabase()).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });

  it.each([
    ['only the URL is set', 'https://example.supabase.co', undefined],
    ['only the anon key is set', undefined, 'anon'],
    ['both are empty strings', '', ''],
  ])('TERM-AC-06 getSupabase() returns null and creates no client when %s', async (_label, url, key) => {
    setEnv(url, key);
    const { createClient } = mockSdk();
    const mod = await load();
    expect(mod.getSupabase()).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });

  it('TERM-AC-06 no client is created at import time even when env is set (created on first use)', async () => {
    setEnv('https://example.supabase.co', 'anon');
    const { createClient } = mockSdk();
    await load();
    expect(createClient).not.toHaveBeenCalled();
  });

  it('TERM-AC-06 getSupabase() creates the client once on first use with the env URL and key, then reuses it', async () => {
    setEnv('https://example.supabase.co', 'anon');
    const { client, createClient } = mockSdk();
    const mod = await load();
    const first = mod.getSupabase();
    const second = mod.getSupabase();
    expect(first).toBe(client);
    expect(second).toBe(first);
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(createClient).toHaveBeenCalledWith('https://example.supabase.co', 'anon');
  });

  it('TERM-AC-06 env is read on first use, not at import (env set after import still yields a client)', async () => {
    const { client } = mockSdk();
    const mod = await load();
    setEnv('https://example.supabase.co', 'anon');
    expect(mod.getSupabase()).toBe(client);
  });

  it('TERM-AC-06 the module exports no eagerly created client (no `supabase` export)', async () => {
    mockSdk();
    const mod = (await load()) as Record<string, unknown>;
    expect('supabase' in mod).toBe(false);
  });

  it('TERM-AC-06 getSupabase() is typed SupabaseClient | null (no cast that drops the SDK generics)', async () => {
    mockSdk();
    const mod = await load();
    expectTypeOf(mod.getSupabase).parameters.toEqualTypeOf<[]>();
    expectTypeOf(mod.getSupabase).returns.toEqualTypeOf<SupabaseClient | null>();
  });
});

describe('analytics helpers fail soft with no env (U-02, F-07)', () => {
  it('TERM-AC-06 store/delete/update helpers resolve false and never touch the SDK when env is missing', async () => {
    const { createClient } = mockSdk();
    const mod = await load();
    const event = { session_id: 's1', event_type: 'command' as const, event_data: { command: 'help' } };
    const session = {
      session_id: 's1', start_time: '2026-11-24T00:00:00.000Z', consent_given: true, device_type: 'desktop',
      commands_count: 0, questions_count: 0, data_retention_hours: 24,
    };
    await expect(mod.storeAnalyticsEvent(event)).resolves.toBe(false);
    await expect(mod.storeSessionData(session)).resolves.toBe(false);
    await expect(mod.deleteUserSessionData('s1')).resolves.toBe(false);
    await expect(mod.updateVisitorStats()).resolves.toBe(false);
    expect(mod.isSupabaseConfigured()).toBe(false);
    expect(createClient).not.toHaveBeenCalled();
  });

  it('TERM-AC-06 getSupabaseAnalytics() resolves null without logging an error when env is missing', async () => {
    const { createClient } = mockSdk();
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mod = await load();
    await expect(mod.getSupabaseAnalytics()).resolves.toBeNull();
    expect(error).not.toHaveBeenCalled();
    expect(createClient).not.toHaveBeenCalled();
  });
});

describe('analytics helpers with a client use the lazy getter (U-02 regression)', () => {
  // Query builder double: a resolved promise of { data, error } whose chain methods return itself.
  function builder(result: { data?: unknown; error: unknown }) {
    const b = Object.assign(Promise.resolve(result), {} as Record<string, unknown>);
    for (const m of ['insert', 'upsert', 'select', 'eq']) b[m] = vi.fn(() => b);
    return b;
  }

  it('TERM-AC-06 with env set, store/delete/update helpers write through the client and resolve true', async () => {
    setEnv('https://example.supabase.co', 'anon');
    const { client, createClient } = mockSdk();
    client.from.mockImplementation(() => builder({ error: null }));
    client.rpc.mockResolvedValue({ error: null });
    const mod = await load();
    const event = { session_id: 's1', event_type: 'command' as const, event_data: { command: 'help' } };
    const session = {
      session_id: 's1', start_time: '2026-11-24T00:00:00.000Z', consent_given: true, device_type: 'desktop',
      commands_count: 0, questions_count: 0, data_retention_hours: 24,
    };
    await expect(mod.storeAnalyticsEvent(event)).resolves.toBe(true);
    await expect(mod.storeSessionData(session)).resolves.toBe(true);
    await expect(mod.deleteUserSessionData('s1')).resolves.toBe(true);
    await expect(mod.updateVisitorStats()).resolves.toBe(true);
    expect(client.from).toHaveBeenCalledWith('analytics_events');
    expect(client.from).toHaveBeenCalledWith('user_sessions');
    expect(client.from).toHaveBeenCalledWith('visitor_stats');
    expect(client.rpc).toHaveBeenCalledWith('delete_user_session_data', { user_session_id: 's1' });
    expect(createClient).toHaveBeenCalledTimes(1);
  });

  it('TERM-AC-06 with env set, getSupabaseAnalytics() aggregates sessions and events from the client', async () => {
    setEnv('https://example.supabase.co', 'anon');
    const { client } = mockSdk();
    const sessions = [
      { session_id: 'a', duration: 10, theme_used: 'dark', device_info: 'desktop' },
      { session_id: 'b', duration: 30, theme_used: 'dark', device_info: 'mobile' },
    ];
    client.from.mockImplementation((table: string) => builder(
      table === 'user_sessions'
        ? { data: sessions, error: null }
        : { data: [{ event_data: { command: 'help' } }], error: null },
    ));
    const mod = await load();
    const stats = await mod.getSupabaseAnalytics();
    expect(stats).toMatchObject({ totalVisitors: 2, totalSessions: 2, averageSessionDuration: 20, totalCommands: 1 });
    expect(stats?.themes).toEqual({ dark: 2 });
  });
});
