import { describe, expect, it } from 'vitest';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { createMajorBowlAccessGeometry } from './createMajorBowlAccessGeometry';

describe('createMajorBowlAccessGeometry', () => {
  it('creates a surfaced, walled route for every configured major cutout', () => {
    const tier = radesStadiumConfig.tiers[0];
    const cutout = tier.majorCutouts[0];
    const geometries = createMajorBowlAccessGeometry(tier, cutout);

    Object.values(geometries).forEach((geometry) => {
      const positions = geometry.getAttribute('position');
      expect(positions.count).toBeGreaterThan(0);
      expect(Array.from(positions.array).every(Number.isFinite)).toBe(true);
      geometry.dispose();
    });
  });
});
