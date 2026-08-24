import { describe, expect, it } from 'vitest';

import { createAccessRampPlacements } from './createAccessRampPlacements';

describe('createAccessRampPlacements', () => {
  it('groups all four ramp towers into two pairs on the entrance side', () => {
    const placements = createAccessRampPlacements({
      centerXs: [-116, -86, 86, 116],
      centerZ: 143,
      count: 4,
      entranceSide: 1,
    });

    expect(placements).toEqual([
      { x: -116, z: 143 },
      { x: -86, z: 143 },
      { x: 86, z: 143 },
      { x: 116, z: 143 },
    ]);
    expect(placements.every(({ z }) => z > 0)).toBe(true);
  });
});
