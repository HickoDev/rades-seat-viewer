import { describe, expect, it } from 'vitest';

import { createStadiumPerimeterWallGeometry } from './createStadiumPerimeterWallGeometry';

describe('createStadiumPerimeterWallGeometry', () => {
  it('cuts multiple configured openings through the structural wall', () => {
    const solid = createStadiumPerimeterWallGeometry({
      bottom: 0,
      extentX: 120,
      extentZ: 84,
      height: 14,
      segments: 128,
    });
    const cut = createStadiumPerimeterWallGeometry({
      bottom: 0,
      extentX: 120,
      extentZ: 84,
      height: 14,
      segments: 128,
      gaps: [
        { centerAngle: 0, angularWidth: 0.1 },
        { centerAngle: Math.PI, angularWidth: 0.1 },
      ],
    });

    expect(cut.getAttribute('position').count).toBeLessThan(
      solid.getAttribute('position').count,
    );

    solid.dispose();
    cut.dispose();
  });
});
