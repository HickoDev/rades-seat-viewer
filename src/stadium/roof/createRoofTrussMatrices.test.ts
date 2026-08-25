import { describe, expect, it } from 'vitest';

import { createRoofTrussMatrices } from './createRoofTrussMatrices';

describe('createRoofTrussMatrices', () => {
  it('creates radial, ring, vertical, and diagonal members for every frame', () => {
    const matrices = createRoofTrussMatrices({
      frameCount: 64,
      innerRadiusX: 108,
      innerRadiusZ: 78,
      outerRadiusX: 154,
      outerRadiusZ: 119,
      innerHeight: 29,
      outerHeight: 33,
      panelThickness: 0.9,
      innerTrussDepth: 3.6,
      trussRadius: 0.18,
    });

    expect(matrices).toHaveLength(64 * 7);
    expect(
      matrices.every((matrix) => matrix.elements.every(Number.isFinite)),
    ).toBe(true);
  });
});
