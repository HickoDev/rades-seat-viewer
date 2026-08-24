import { describe, expect, it } from 'vitest';

import { createTierGeometry } from './createTierGeometry';

describe('createTierGeometry', () => {
  it('raises each successive seating row', () => {
    const geometry = createTierGeometry({
      startAngle: 0,
      endAngle: Math.PI / 8,
      startRadiusX: 78,
      startRadiusZ: 60,
      baseHeight: 2,
      rowCount: 3,
      rowDepth: 0.82,
      rowHeight: 0.42,
      angularSegments: 1,
    });
    const positions = geometry.getAttribute('position');
    const heights = Array.from({ length: positions.count }, (_, index) =>
      positions.getY(index),
    );

    expect(Math.max(...heights)).toBeCloseTo(3.26, 4);
    expect(new Set(heights.map((height) => height.toFixed(2))).size).toBe(4);
  });
});
