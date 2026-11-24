// TERM-AC-05 (U-04, U-03 review minor): with the dead /v1 → / branch gone, a stable version
// navigates to its own route ("v1" is /terminal); non-stable versions do nothing.
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AVAILABLE_VERSIONS } from '@/terminal/lib/version';
import { VersionDropdown } from './VersionDropdown';

describe('VersionDropdown (U-04)', () => {
  it('TERM-AC-05 selecting a stable version passes its own route to onVersionSelect', () => {
    const onVersionSelect = vi.fn();
    render(
      <VersionDropdown versions={AVAILABLE_VERSIONS} currentVersion="" onVersionSelect={onVersionSelect} getVersionIcon={() => <span />} />,
    );
    const stable = AVAILABLE_VERSIONS.filter((v) => v.status === 'stable');
    expect(stable.length).toBeGreaterThan(0);
    for (const v of AVAILABLE_VERSIONS) fireEvent.click(screen.getAllByText(v.name)[0]);
    expect(onVersionSelect.mock.calls).toEqual(stable.map((v) => [v.route, 'stable']));
    expect(stable.find((v) => v.version.startsWith('1.'))?.route).toBe('/terminal');
  });
});
