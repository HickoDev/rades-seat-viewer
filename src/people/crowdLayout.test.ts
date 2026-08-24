import { describe, expect, it } from 'vitest';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { generateCrowdMembers, radesCrowdPlacementLayout } from './crowdLayout';

describe('generateCrowdMembers', () => {
  it('is deterministic and respects the requested occupancy range', () => {
    const placements = radesCrowdPlacementLayout.metadata.slice(0, 2_000);
    const first = generateCrowdMembers(placements, 0.7);
    const second = generateCrowdMembers(placements, 0.7);

    expect(first).toEqual(second);
    expect(first.length).toBeGreaterThan(1_250);
    expect(first.length).toBeLessThan(1_550);
  });

  it('can populate the seatless virage terraces without creating seats there', () => {
    const lowerTier = radesStadiumConfig.tiers[0];
    const virageSectionId = `${lowerTier.id}-${String(
      lowerTier.seatlessSectionIndices[0] + 1,
    ).padStart(2, '0')}`;
    const crowd = generateCrowdMembers(radesCrowdPlacementLayout.metadata, 1);

    expect(
      crowd.some((member) => member.placement.sectionId === virageSectionId),
    ).toBe(true);
  });
});
