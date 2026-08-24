import type { SeatMetadata } from '../seats/seat.types';
import { radesViewingPositionLayout } from '../seats/viewingPositions';

export type CrowdMember = {
  placement: SeatMetadata;
  placementIndex: number;
  clothingColorIndex: number;
  skinColorIndex: number;
  animated: boolean;
  motionPhase: number;
  motionStrength: number;
};

export const radesCrowdPlacementLayout = radesViewingPositionLayout;

function stableHash(value: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

export function generateCrowdMembers(
  placements: SeatMetadata[],
  occupancy: number,
  animatedFraction = 0.06,
): CrowdMember[] {
  const threshold = Math.round(Math.min(Math.max(occupancy, 0), 1) * 10_000);
  const animatedThreshold = Math.round(
    Math.min(Math.max(animatedFraction, 0), 1) * 10_000,
  );
  const members: CrowdMember[] = [];

  placements.forEach((placement, placementIndex) => {
    const hash = stableHash(placement.id);
    if (hash % 10_000 >= threshold) return;

    members.push({
      placement,
      placementIndex,
      clothingColorIndex: (hash >>> 8) % 7,
      skinColorIndex: (hash >>> 16) % 5,
      animated: (hash >>> 12) % 10_000 < animatedThreshold,
      motionPhase: ((hash >>> 4) % 6_283) / 1_000,
      motionStrength: 0.65 + ((hash >>> 24) % 36) / 100,
    });
  });

  return members;
}
