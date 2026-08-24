import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { generateSeatLayout } from '../seats/generateSeatLayout';
import type { SeatMetadata } from '../seats/seat.types';

export type CrowdMember = {
  placement: SeatMetadata;
  placementIndex: number;
  clothingColorIndex: number;
  skinColorIndex: number;
};

export const radesCrowdPlacementLayout = generateSeatLayout(
  radesStadiumConfig,
  { includeSeatlessSections: true },
);

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
): CrowdMember[] {
  const threshold = Math.round(Math.min(Math.max(occupancy, 0), 1) * 10_000);
  const members: CrowdMember[] = [];

  placements.forEach((placement, placementIndex) => {
    const hash = stableHash(placement.id);
    if (hash % 10_000 >= threshold) return;

    members.push({
      placement,
      placementIndex,
      clothingColorIndex: (hash >>> 8) % 7,
      skinColorIndex: (hash >>> 16) % 5,
    });
  });

  return members;
}
