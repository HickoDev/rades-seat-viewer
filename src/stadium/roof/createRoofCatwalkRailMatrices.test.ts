import { describe, expect, it } from 'vitest';

import { createRoofCatwalkRailMatrices } from './createRoofCatwalkRailMatrices';

describe('createRoofCatwalkRailMatrices', () => {
  it('creates posts and top rails on both edges of the maintenance ring', () => {
    const matrices = createRoofCatwalkRailMatrices({
      innerRadiusX: 109,
      innerRadiusZ: 79,
      width: 1.45,
      height: 28.45,
      railHeight: 1.05,
      segmentCount: 64,
      radius: 0.035,
    });

    expect(matrices).toHaveLength(64 * 2 * 2);
    expect(
      matrices.every((matrix) => matrix.elements.every(Number.isFinite)),
    ).toBe(true);
  });
});
