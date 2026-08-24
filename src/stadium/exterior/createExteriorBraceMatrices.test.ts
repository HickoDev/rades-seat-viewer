import { describe, expect, it } from 'vitest';

import { createExteriorBraceMatrices } from './createExteriorBraceMatrices';

describe('createExteriorBraceMatrices', () => {
  it('creates two finite diagonal members for every facade bay', () => {
    const matrices = createExteriorBraceMatrices({
      bayCount: 32,
      radiusX: 159,
      radiusZ: 124,
      bottomHeight: 20,
      topHeight: 29,
      radius: 0.16,
    });

    expect(matrices).toHaveLength(64);
    expect(
      matrices.every((matrix) => matrix.elements.every(Number.isFinite)),
    ).toBe(true);
  });
});
