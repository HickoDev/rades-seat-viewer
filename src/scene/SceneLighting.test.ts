import { describe, expect, it } from 'vitest';

import { calculateDaylightLightingLevels } from './calculateDaylightLightingLevels';

describe('calculateDaylightLightingLevels', () => {
  it('keeps substantial sky fill in daytime stadium shadows', () => {
    const midday = calculateDaylightLightingLevels(1, false);
    const shadedFill = midday.hemisphereIntensity + midday.ambientIntensity;

    expect(shadedFill).toBeGreaterThan(1);
    expect(midday.directionalIntensity / shadedFill).toBeLessThan(2.5);
  });

  it('keeps night fill restrained and disables astronomical sunlight', () => {
    const night = calculateDaylightLightingLevels(0, true);

    expect(night.directionalIntensity).toBe(0);
    expect(night.hemisphereIntensity + night.ambientIntensity).toBeLessThan(
      0.25,
    );
  });
});
