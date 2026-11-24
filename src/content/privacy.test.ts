// U-10 HOME-AC-28 (content half): the privacy notice says what compliance.md §1 says, names the
// controller with a LinkedIn contact, and has no email. The chat and Groq are not listed (chat is off).
import { describe, expect, it } from 'vitest';

import { privacy } from './privacy';
import { profile } from './profile';

const text = JSON.stringify(privacy);

describe('privacy notice content', () => {
  it('HOME-AC-28 names the controller (the owner) with a LinkedIn contact link from the profile', () => {
    expect(privacy.controller.name).toBe(profile.name);
    expect(privacy.controller.contactUrl).toBe(profile.links.linkedin);
  });

  it('HOME-AC-28 covers Vercel request logs and Web Analytics (24 h hash), and Supabase visit counters on /terminal', () => {
    expect(text).toMatch(/Vercel/);
    expect(text).toMatch(/request logs?/i);
    expect(text).toMatch(/Web Analytics/);
    expect(text).toMatch(/24 hours/);
    expect(text).toMatch(/Supabase/);
    expect(text).toMatch(/\/terminal/);
  });

  it('HOME-AC-28 lists every /terminal localStorage key the terminal code writes', () => {
    for (const key of ['tijothomas-theme', 'tijothomas-zoom', 'tijothomas-sounds', 'portfolio-analytics']) {
      expect(text).toContain(key);
    }
  });

  it('HOME-AC-28 covers lawful basis, processors and transfers, retention, rights (Art. 11) and the right to complain', () => {
    expect(text).toMatch(/legitimate interests/i);
    expect(text).toMatch(/United States/);
    expect(text).toMatch(/retention|kept/i);
    expect(text).toMatch(/Article 11/);
    expect(text).toMatch(/supervisory authority/i);
    expect(text).toMatch(/ICO/);
  });

  it('HOME-AC-28 has a section per required topic, each with a heading and some body text', () => {
    expect(privacy.sections.length).toBeGreaterThanOrEqual(7);
    for (const s of privacy.sections) {
      expect(s.heading.trim()).not.toBe('');
      expect(s.paragraphs.length + (s.items?.length ?? 0)).toBeGreaterThan(0);
    }
  });

  it('HOME-AC-28 SEC-23 contains no email address, mailto: or phone, and does not list the disabled chat or Groq', () => {
    expect(text).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|mailto:|tel:|\+\d{2}/i);
    expect(text).not.toMatch(/Groq|chat/i);
  });

  it('HOME-AC-28 has an ISO last-updated date', () => {
    expect(privacy.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
