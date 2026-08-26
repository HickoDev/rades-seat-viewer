import { describe, expect, it } from 'vitest';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { createScoreboardPlacements } from './scoreboardPlacements';

describe('createScoreboardPlacements', () => {
  it('plants both displays into the upper virage instead of the roof', () => {
    const placements = createScoreboardPlacements(radesStadiumConfig);
    const upperTier = radesStadiumConfig.tiers.find(
      (tier) => tier.id === 'upper',
    );

    expect(placements).toHaveLength(2);
    expect(upperTier).toBeDefined();
    for (const placement of placements) {
      expect(Math.abs(placement.position[0])).toBeGreaterThan(
        upperTier?.startRadiusX ?? 0,
      );
      expect(placement.terraceHeight).toBeGreaterThan(
        upperTier?.baseHeight ?? 0,
      );
      expect(placement.position[1]).toBeLessThan(
        radesStadiumConfig.roof.innerHeight,
      );
      expect(
        placement.position[1] -
          radesStadiumConfig.structure.scoreboardHeight / 2 -
          placement.supportHeight,
      ).toBeCloseTo(placement.terraceHeight, 5);
    }
  });
});
