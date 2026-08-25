import { describe, expect, it } from 'vitest';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { createGrandstandFacilityLayout } from './grandstandLayout';

describe('createGrandstandFacilityLayout', () => {
  const volumes = createGrandstandFacilityLayout(radesStadiumConfig.grandstand);

  it('separates the honor, press, control, and service facilities', () => {
    expect(
      volumes.filter((volume) => volume.kind === 'honor-suite'),
    ).toHaveLength(1);
    expect(
      volumes.filter((volume) => volume.kind === 'press-suite'),
    ).toHaveLength(2);
    expect(
      volumes.filter((volume) => volume.kind === 'control-room'),
    ).toHaveLength(2);
    expect(
      volumes.filter((volume) => volume.kind === 'service-core'),
    ).toHaveLength(2);
  });

  it('keeps the estimated complex inside its configured width', () => {
    const outerEdge = Math.max(
      ...volumes.map((volume) => Math.abs(volume.centerX) + volume.width / 2),
    );

    expect(outerEdge * 2).toBeLessThanOrEqual(
      radesStadiumConfig.grandstand.width,
    );
  });
});
