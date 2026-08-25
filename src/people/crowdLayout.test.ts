import { describe, expect, it } from 'vitest';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { isVisitorClosedSection } from '../seats/viewingPositions';
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

  it('excludes closed upper-virage placements from the public crowd', () => {
    const publicCrowd = generateCrowdMembers(
      radesCrowdPlacementLayout.metadata,
      1,
    ).filter((member) => !isVisitorClosedSection(member.placement.sectionId));

    expect(
      publicCrowd.every(
        (member) => !isVisitorClosedSection(member.placement.sectionId),
      ),
    ).toBe(true);
  });

  it('marks only a restrained deterministic subset for idle animation', () => {
    const placements = radesCrowdPlacementLayout.metadata.slice(0, 10_000);
    const crowd = generateCrowdMembers(placements, 1, 0.06);
    const animated = crowd.filter((member) => member.animated);

    expect(animated.length).toBeGreaterThan(400);
    expect(animated.length).toBeLessThan(800);
    expect(animated.every((member) => member.motionStrength > 0)).toBe(true);
  });
});
