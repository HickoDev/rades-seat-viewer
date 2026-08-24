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

  it('adds a repeating scallop only to the outer membrane edge', () => {
    const geometry = createRoofGeometry({
      innerRadiusX: 86,
      innerRadiusZ: 65,
      outerRadiusX: 128,
      outerRadiusZ: 102,
      innerHeight: 34,
      outerHeight: 42,
      thickness: 0.9,
      segments: 32,
      waveCount: 8,
      outerWaveHeight: 0.7,
      outerWaveRadius: 0.9,
    });
    const positions = geometry.getAttribute('position');

    expect(positions.getX(0)).toBeCloseTo(86, 4);
    expect(positions.getY(0)).toBeCloseTo(34, 4);
    expect(positions.getX(1)).toBeCloseTo(128.9, 4);
    expect(positions.getY(1)).toBeCloseTo(42.7, 4);
    expect(positions.getY(9)).toBeCloseTo(41.3, 4);
  });
});
