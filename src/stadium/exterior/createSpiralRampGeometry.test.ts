import { describe, expect, it } from 'vitest';

import { createSpiralRampGeometry } from './createSpiralRampGeometry';

describe('createSpiralRampGeometry', () => {
  it('creates a finite rising ramp with the configured footprint and height', () => {
    const geometry = createSpiralRampGeometry({
      outerRadius: 10.8,
      width: 3.2,
      height: 13.76,
      turns: 3.25,
    });
    const bounds = geometry.boundingBox;

    expect(bounds).not.toBeNull();
    expect(bounds?.max.y).toBeCloseTo(13.76, 2);
    expect(bounds?.min.y).toBeLessThan(0);
    expect(bounds?.max.x).toBeLessThanOrEqual(10.81);
    expect(
      Array.from(geometry.getAttribute('position').array).every(
        Number.isFinite,
      ),
    ).toBe(true);
    geometry.dispose();
  });
});
