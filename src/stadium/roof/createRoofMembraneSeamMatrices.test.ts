import { describe, expect, it } from 'vitest';

import { createRoofMembraneSeamMatrices } from './createRoofMembraneSeamMatrices';

describe('createRoofMembraneSeamMatrices', () => {
  it('creates one finite radial seam for each visible membrane bay', () => {
    const matrices = createRoofMembraneSeamMatrices({
      seamCount: 32,
      innerRadiusX: 108,
      innerRadiusZ: 78,
      outerRadiusX: 154,
      outerRadiusZ: 119,
      innerHeight: 29,
      outerHeight: 33,
      outerWaveHeight: 0.72,
      outerWaveRadius: 0.9,
      radius: 0.055,
    });

    expect(matrices).toHaveLength(32);
    expect(
      matrices.every((matrix) => matrix.elements.every(Number.isFinite)),
    ).toBe(true);
  });
});
