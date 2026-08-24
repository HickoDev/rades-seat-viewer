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
    expect(positions.getY(2)).toBeCloseTo(42, 4);
    expect(geometry.getIndex()?.count).toBe(16 * 36);
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
      innerWaveHeight: 0.3,
      membraneSag: 1.2,
    });
    const positions = geometry.getAttribute('position');

    expect(positions.getX(0)).toBeCloseTo(86, 4);
    expect(positions.getY(0)).toBeCloseTo(34.3, 4);
    expect(positions.getY(1)).toBeLessThan(39);
    expect(positions.getX(2)).toBeCloseTo(128.9, 4);
    expect(positions.getY(2)).toBeCloseTo(42.7, 4);
    expect(positions.getY(14)).toBeCloseTo(41.3, 4);
  });
});
