// TERM-AC-08 (U-04, SQ-01 c): chat is off. Every client path that used to call /api/chat answers
// with the single CHAT_UNAVAILABLE_MESSAGE constant and makes no request. The shared http client
// is the boundary that would reach /api/chat, so it is mocked and asserted to be unused.
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const post = vi.fn();
const get = vi.fn();
vi.mock('../../../shared/api/http', () => ({ http: { post, get } }));
vi.mock('../../../lib/sounds', () => ({ soundManager: { playNotification: vi.fn() } }));
vi.mock('../../../lib/simple-analytics', () => ({ trackQuestion: vi.fn() }));

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
let fetchSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  post.mockReset();
  get.mockReset();
  fetchSpy = vi.fn(() => Promise.reject(new Error('no network in tests')));
  vi.stubGlobal('fetch', fetchSpy);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('chat unavailable (U-04)', () => {
  it('TERM-AC-08 CHAT_UNAVAILABLE_MESSAGE is a non-empty constant with no email, pointing to LinkedIn', async () => {
    const { CHAT_UNAVAILABLE_MESSAGE } = await import('./chatUnavailable');
    expect(typeof CHAT_UNAVAILABLE_MESSAGE).toBe('string');
    expect(CHAT_UNAVAILABLE_MESSAGE.length).toBeGreaterThan(10);
    expect(CHAT_UNAVAILABLE_MESSAGE).not.toMatch(EMAIL);
    expect(CHAT_UNAVAILABLE_MESSAGE).toMatch(/LinkedIn/);
  });

  it('TERM-AC-08 the chat model module re-exports the same constant', async () => {
    const a = await import('./chatUnavailable');
    const b = await import('./useChatAssistant');
    expect(b.CHAT_UNAVAILABLE_MESSAGE).toBe(a.CHAT_UNAVAILABLE_MESSAGE);
  });

  it('TERM-AC-08 usePromptShield().generateResponse answers with the constant and sends no request', async () => {
    const { CHAT_UNAVAILABLE_MESSAGE } = await import('./chatUnavailable');
    const { usePromptShield } = await import('../../prompt-shield/model/usePromptShield');
    const { result } = renderHook(() => usePromptShield());
    let res: Awaited<ReturnType<typeof result.current.generateResponse>> | undefined;
    await act(async () => {
      res = await result.current.generateResponse({ message: 'hi', sessionId: 's', conversationHistory: [], portfolioContext: {} } as never);
    });
    expect(res?.response).toBe(CHAT_UNAVAILABLE_MESSAGE);
    expect(post).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('TERM-AC-08 sending a chat message shows the constant as the reply and sends no chat request', async () => {
    const { CHAT_UNAVAILABLE_MESSAGE } = await import('./chatUnavailable');
    const { useChatAssistant } = await import('./useChatAssistant');
    const { result } = renderHook(() => useChatAssistant());
    await act(async () => {
      await result.current.handleSendMessage('What does Tijo work on?');
    });
    const last = result.current.messages.at(-1);
    expect(last?.isUser).toBe(false);
    expect(last?.text).toBe(CHAT_UNAVAILABLE_MESSAGE);
    expect(post).not.toHaveBeenCalled();
    expect(fetchSpy.mock.calls.filter(([u]) => String(u).includes('/api/chat'))).toEqual([]);
  });
});
