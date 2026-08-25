import { describe, expect, it } from 'vitest';

import { createAthleticsEventApronGeometry } from './createAthleticsEventGeometry';

describe('createAthleticsEventApronGeometry', () => {
  it('fills a track-bend segment without entering the pitch', () => {
    const geometry = createAthleticsEventApronGeometry({
      curveRadius: 36.5,
      pitchLength: 105,
      startOffset: 3.5,
      straightLength: 84.39,
    });
    const bounds = geometry.boundingBox;

    expect(bounds).not.toBeNull();
    expect(bounds?.min.x).toBeCloseTo(56, 3);
    expect(bounds?.max.x).toBeCloseTo(78.695, 3);
    expect(bounds?.min.x).toBeGreaterThan(105 / 2);
    geometry.dispose();
  });

  it('supports independently sized event aprons at each bend', () => {
    const west = createAthleticsEventApronGeometry({
      curveRadius: 36.5,
      pitchLength: 105,
      startOffset: 3.5,
      straightLength: 84.39,
    });
    const east = createAthleticsEventApronGeometry({
      curveRadius: 36.5,
      pitchLength: 105,
      startOffset: 4.8,
      straightLength: 84.39,
    });

    expect(west.boundingBox?.min.x).not.toBe(east.boundingBox?.min.x);
    expect(west.boundingBox?.min.y).not.toBe(east.boundingBox?.min.y);
    west.dispose();
    east.dispose();
  });
});
