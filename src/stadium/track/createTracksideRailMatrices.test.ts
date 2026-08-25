import { describe, expect, it } from 'vitest';

import { createTracksideRailMatrices } from './createTracksideRailMatrices';

describe('createTracksideRailMatrices', () => {
  it('creates a closed set of posts and two horizontal rails', () => {
    const matrices = createTracksideRailMatrices({
      baseHeight: 2.4,
      height: 1.05,
      midRailRatio: 0.54,
      radius: 0.035,
      radiusX: 95.2,
      radiusZ: 59.2,
      segmentCount: 128,
    });

    expect(matrices).toHaveLength(128 * 3);
    expect(
      matrices.every((matrix) => matrix.elements.every(Number.isFinite)),
    ).toBe(true);
  });
});
