// PLAT-AC-05 probe: proves vitest collects tests under lib/ and resolves the `@/` alias.
// U-05 retargets the import to `@/content/profile` once content/ exists (the AC's literal wording).
import { describe, expect, it } from 'vitest';
import { cn } from '@/terminal/lib/utils';

describe('vitest config', () => {
  it('PLAT-AC-05 loads a module imported through the @/ alias from a test under lib/', () => {
    expect(typeof cn).toBe('function');
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});
