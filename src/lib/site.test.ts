// U-05: the canonical origin has one source, profile.siteUrl in src/content (F-69).
import { describe, expect, it } from 'vitest';

import { profile } from '../content/profile';
import { siteUrl } from './site';

describe('siteUrl', () => {
  it('CONT-AC-13 U-05 siteUrl is profile.siteUrl, an https:// origin with no trailing slash', () => {
    expect(siteUrl).toBe(profile.siteUrl);
    expect(siteUrl).toMatch(/^https:\/\/[a-z0-9.-]+$/);
  });
});
