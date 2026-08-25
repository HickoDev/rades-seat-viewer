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

export type VirageSupporterMotion = {
  verticalOffset: number;
  yawOffsetRadians: number;
  forwardLeanRadians: number;
  scaleY: number;
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

export function calculateVirageSupporterMotion(
  member: CrowdMember,
  elapsedSeconds: number,
  amplitude: number,
  cyclesPerSecond: number,
): VirageSupporterMotion {
  const placement = member.placement;
  const beat = elapsedSeconds * cyclesPerSecond * Math.PI * 2;
  const terraceWavePhase =
    placement.rowNumber * 0.19 +
    placement.seatNumber * 0.065 +
    member.motionPhase * 0.14;
  const wave = beat + terraceWavePhase;
  const upwardPulse = Math.max(0, Math.sin(wave));
  const followThrough = Math.max(0, Math.sin(wave * 0.5 + 0.8));
  const verticalOffset =
    amplitude *
    member.motionStrength *
    (upwardPulse * 0.86 + followThrough * 0.14);

  return {
    verticalOffset,
    yawOffsetRadians:
      Math.sin(wave * 0.54 + member.motionPhase) *
      0.024 *
      member.motionStrength,
    forwardLeanRadians:
      Math.sin(wave - Math.PI * 0.18) * 0.035 * member.motionStrength,
    scaleY: 1 - upwardPulse * 0.022 * member.motionStrength,
  };
}
