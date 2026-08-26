import { getSectionId } from '../stadium/bowl/sectionIds';
import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { generateSeatLayout } from './generateSeatLayout';
import { findSeat } from './seatMetadata';
import type { SeatMetadata } from './seat.types';

export type ViewingPositionKind = 'seat' | 'terrace';

export type ViewingPosition = {
  kind: ViewingPositionKind;
  metadata: SeatMetadata;
};

/**
 * A shared spectator-position grid. It includes concrete virage terraces, but
 * it is not passed to the chair InstancedMesh and therefore does not invent
 * physical seats in those sections.
 */
export const radesViewingPositionLayout = generateSeatLayout(
  radesStadiumConfig,
  { includeSeatlessSections: true },
);

const terraceSectionIds = new Set(
  radesStadiumConfig.tiers.flatMap((tier) =>
    tier.seatlessSectionIndices.map((sectionIndex) =>
      getSectionId(tier.id, sectionIndex),
    ),
  ),
);

const visitorClosedSectionIds = new Set(
  radesStadiumConfig.tiers.flatMap((tier) =>
    tier.closedToVisitorsSectionIndices.map((sectionIndex) =>
      getSectionId(tier.id, sectionIndex),
    ),
  ),
);

export function isTerraceSection(sectionId: string | null): boolean {
  return sectionId !== null && terraceSectionIds.has(sectionId);
}

export function isVisitorClosedSection(sectionId: string | null): boolean {
  return sectionId !== null && visitorClosedSectionIds.has(sectionId);
}

export function findViewingPosition(
  sectionId: string | null,
  rowNumber: number | null,
  positionNumber: number | null,
  requestedKind: ViewingPositionKind | null = null,
): ViewingPosition | null {
  if (!sectionId || rowNumber === null || positionNumber === null) return null;
  if (isVisitorClosedSection(sectionId)) return null;

  const kind =
    requestedKind ?? (isTerraceSection(sectionId) ? 'terrace' : 'seat');
  const metadata =
    kind === 'seat'
      ? findSeat(sectionId, rowNumber, positionNumber)
      : (radesViewingPositionLayout.metadata.find(
          (position) =>
            position.sectionId === sectionId &&
            position.rowNumber === rowNumber &&
            position.seatNumber === positionNumber,
        ) ?? null);

  return metadata ? { kind, metadata } : null;
}

export function findRepresentativeTerracePosition(
  sectionId: string,
): SeatMetadata | null {
  if (!isTerraceSection(sectionId) || isVisitorClosedSection(sectionId)) {
    return null;
  }

  const sectionPositions = radesViewingPositionLayout.metadata.filter(
    (position) => position.sectionId === sectionId,
  );
  if (sectionPositions.length === 0) return null;

  const rows = [
    ...new Set(sectionPositions.map((position) => position.rowNumber)),
  ];
  const representativeRow = rows[Math.floor(rows.length * 0.55)];
  const rowPositions = sectionPositions.filter(
    (position) => position.rowNumber === representativeRow,
  );

  return rowPositions[Math.floor(rowPositions.length / 2)] ?? null;
}

/**
 * Resolves any end-stand section to the nearest open lower-virage POV. This
 * lets the large but visitor-closed upper virage act as a discoverable click
 * target without pretending that its own seats are publicly accessible.
 */
export function findClosestOpenTerracePosition(
  sectionId: string,
): SeatMetadata | null {
  const directPosition = findRepresentativeTerracePosition(sectionId);
  if (directPosition) return directPosition;

  const [tierId, sectionNumberText] = sectionId.split('-');
  const sourceTier = radesStadiumConfig.tiers.find(
    (tier) => tier.id === tierId,
  );
  const lowerTier = radesStadiumConfig.tiers.find(
    (tier) => tier.id === 'lower',
  );
  const sectionIndex = Number(sectionNumberText) - 1;
  if (!sourceTier || !lowerTier || !Number.isInteger(sectionIndex)) return null;

  const sourceProgress = (sectionIndex + 0.5) / sourceTier.sectionCount;
  const closestTerraceIndex = lowerTier.seatlessSectionIndices.reduce(
    (closest, candidate) => {
      const candidateProgress = (candidate + 0.5) / lowerTier.sectionCount;
      const rawDistance = Math.abs(candidateProgress - sourceProgress);
      const wrappedDistance = Math.min(rawDistance, 1 - rawDistance);
      const closestProgress = (closest + 0.5) / lowerTier.sectionCount;
      const closestRawDistance = Math.abs(closestProgress - sourceProgress);
      const closestWrappedDistance = Math.min(
        closestRawDistance,
        1 - closestRawDistance,
      );
      return wrappedDistance < closestWrappedDistance ? candidate : closest;
    },
    lowerTier.seatlessSectionIndices[0] ?? -1,
  );
  if (closestTerraceIndex < 0) return null;

  return findRepresentativeTerracePosition(
    getSectionId(lowerTier.id, closestTerraceIndex),
  );
}
