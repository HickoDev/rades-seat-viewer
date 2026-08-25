import { describe, expect, it } from 'vitest';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { isVisitorClosedSection } from '../seats/viewingPositions';
import {
  calculateVirageSupporterMotion,
  generateCrowdMembers,
  radesCrowdPlacementLayout,
} from './crowdLayout';

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

  it('filters placements before constructing crowd members and preserves source indices', () => {
    const placements = radesCrowdPlacementLayout.metadata.slice(0, 120);
    const crowd = generateCrowdMembers(
      placements,
      1,
      0.06,
      (_placement, placementIndex) => placementIndex % 2 === 0,
    );

    expect(crowd).toHaveLength(60);
    expect(crowd.every((member) => member.placementIndex % 2 === 0)).toBe(true);
    expect(crowd.map((member) => member.placementIndex).slice(0, 3)).toEqual([
      0, 2, 4,
    ]);
  });

  it('creates bounded, staggered supporter bounces across the virage', () => {
    const members = generateCrowdMembers(
      radesCrowdPlacementLayout.metadata.slice(0, 10_000),
      1,
      1,
    );
    const first = members[0];
    const second = members.find(
      (member) =>
        member.placement.rowNumber !== first.placement.rowNumber ||
        member.placement.seatNumber !== first.placement.seatNumber,
    );
    expect(second).toBeDefined();
    if (!second) return;

    const amplitude = 0.085;
    const firstMotion = calculateVirageSupporterMotion(
      first,
      1.25,
      amplitude,
      1.05,
    );
    const repeatedMotion = calculateVirageSupporterMotion(
      first,
      1.25,
      amplitude,
      1.05,
    );
    const neighbouringMotion = calculateVirageSupporterMotion(
      second,
      1.25,
      amplitude,
      1.05,
    );

    expect(repeatedMotion).toEqual(firstMotion);
    expect(firstMotion.verticalOffset).toBeGreaterThanOrEqual(0);
    expect(firstMotion.verticalOffset).toBeLessThanOrEqual(amplitude);
    expect(firstMotion.scaleY).toBeGreaterThanOrEqual(0.978);
    expect(firstMotion.scaleY).toBeLessThanOrEqual(1);
    expect(neighbouringMotion).not.toEqual(firstMotion);
  });
});
