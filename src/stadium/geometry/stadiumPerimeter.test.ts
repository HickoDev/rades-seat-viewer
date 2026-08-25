import { describe, expect, it } from 'vitest';

import {
  getStadiumPerimeterAngleForDistance,
  getStadiumPerimeterLength,
  getStadiumPerimeterPoint,
} from './stadiumPerimeter';

describe('stadiumPerimeter', () => {
  it('preserves the configured outer bounds and flat long sides', () => {
    expect(getStadiumPerimeterPoint(0, 96, 60)).toEqual({ x: 96, z: 0 });
    expect(getStadiumPerimeterPoint(Math.PI / 2, 96, 60)).toEqual({
      x: 0,
      z: 60,
    });
    expect(getStadiumPerimeterPoint(Math.PI, 96, 60).x).toBeCloseTo(-96, 8);

    const first = getStadiumPerimeterPoint(Math.PI * 0.4, 96, 60);
    const second = getStadiumPerimeterPoint(Math.PI * 0.6, 96, 60);
    expect(first.z).toBeCloseTo(60, 8);
    expect(second.z).toBeCloseTo(60, 8);
    expect(first.x).toBeGreaterThan(second.x);
  });

  it('maps physical widths into stable perimeter angles', () => {
    const perimeter = getStadiumPerimeterLength(96, 60);
    expect(
      getStadiumPerimeterAngleForDistance(perimeter / 32, 96, 60),
    ).toBeCloseTo((Math.PI * 2) / 32, 8);
  });
});
