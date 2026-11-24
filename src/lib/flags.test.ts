// U-05: the SHOW_PLANNED flag parser fails closed. Only the exact string "true" shows planned items.
import { describe, expect, it } from 'vitest';

import { isShowPlanned } from './flags';

describe('isShowPlanned', () => {
  it('CONT-AC-05 returns true only for the exact string "true"', () => {
    expect(isShowPlanned('true')).toBe(true);
  });

  it.each([['false'], [''], ['1'], ['TRUE '], ['TRUE'], [' true'], ['yes'], [undefined]])(
    'CONT-AC-05 returns false for %j',
    (raw) => {
      expect(isShowPlanned(raw)).toBe(false);
    },
  );
});
