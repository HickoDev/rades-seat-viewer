import { describe, expect, it } from 'vitest';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { createStadiumSiteBaseGeometry } from './createStadiumSiteBaseGeometry';

describe('createStadiumSiteBaseGeometry', () => {
  it('creates finite site geometry around the open virage cuts', () => {
    const lowerTier = radesStadiumConfig.tiers.find(
      (tier) => tier.id === 'lower',
    );
    expect(lowerTier).toBeDefined();
    if (!lowerTier) return;

    const geometry = createStadiumSiteBaseGeometry(
      radesStadiumConfig.site.baseRadiusX,
      radesStadiumConfig.site.baseRadiusZ,
      lowerTier,
    );
    const positions = geometry.getAttribute('position');

    expect(positions.count).toBeGreaterThan(0);
    expect(Array.from(positions.array).every(Number.isFinite)).toBe(true);
    geometry.dispose();
  });
});
