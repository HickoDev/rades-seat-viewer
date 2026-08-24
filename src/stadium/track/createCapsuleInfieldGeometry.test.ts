import { describe, expect, it } from 'vitest';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { createCapsuleInfieldGeometry } from './createCapsuleInfieldGeometry';

describe('createCapsuleInfieldGeometry', () => {
  it('covers the pitch and follows the inner track envelope', () => {
    const { pitch, track } = radesStadiumConfig;
    const geometry = createCapsuleInfieldGeometry(
      track.innerCurveRadius,
      track.straightLength,
    );
    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox;

    expect(bounds).not.toBeNull();
    expect(bounds?.max.x).toBeGreaterThan(pitch.length / 2);
    expect(bounds?.min.x).toBeLessThan(-pitch.length / 2);
    expect(bounds?.max.y).toBeGreaterThan(pitch.width / 2);
    expect(bounds?.min.y).toBeLessThan(-pitch.width / 2);

    geometry.dispose();
  });
});
