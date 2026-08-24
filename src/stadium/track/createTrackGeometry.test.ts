import { describe, expect, it } from 'vitest';

import { createTrackGeometry, getCapsulePoint } from './createTrackGeometry';

describe('createTrackGeometry', () => {
  it('creates a finite indexed track ring', () => {
    const geometry = createTrackGeometry({
      innerRadius: 36.5,
      laneCount: 8,
      laneWidth: 1.22,
      straightLength: 84.39,
      segments: 64,
    });

    expect(geometry.getAttribute('position').count).toBe(130);
    expect(geometry.getIndex()?.count).toBe(384);
    expect(
      Array.from(geometry.getAttribute('position').array).every(
        Number.isFinite,
      ),
    ).toBe(true);
  });

  it('keeps the capsule endpoints aligned to the configured radius', () => {
    const point = getCapsulePoint(0, 36.5, 84.39);

    expect(point.x).toBeCloseTo(84.39 / 2, 5);
    expect(point.z).toBeCloseTo(-36.5, 5);
  });
});
