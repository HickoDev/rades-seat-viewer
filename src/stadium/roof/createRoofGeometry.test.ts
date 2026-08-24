import { describe, expect, it } from 'vitest';

import { createRoofGeometry } from './createRoofGeometry';

describe('createRoofGeometry', () => {
  it('preserves an open centre and configured vertical slope', () => {
    const geometry = createRoofGeometry({
      innerRadiusX: 86,
      innerRadiusZ: 65,
      outerRadiusX: 128,
      outerRadiusZ: 102,
      innerHeight: 34,
      outerHeight: 42,
      thickness: 0.9,
      segments: 16,
    });
    const positions = geometry.getAttribute('position');

    expect(positions.getX(0)).toBeCloseTo(86, 4);
    expect(positions.getY(0)).toBeCloseTo(34, 4);
    expect(positions.getY(1)).toBeCloseTo(42, 4);
    expect(geometry.getIndex()?.count).toBe(16 * 24);
  });
});
