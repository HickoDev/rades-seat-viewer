import { findViewingPosition } from '../seats/viewingPositions';
import { getInteriorSectionZone } from '../stadium/bowl/sectionZones';
import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { useStadiumStore } from '../state/useStadiumStore';

export function SeatInformation() {
  const sectionId = useStadiumStore((state) => state.selectedSectionId);
  const row = useStadiumStore((state) => state.selectedRow);
  const positionNumber = useStadiumStore((state) => state.selectedSeat);
  const viewKind = useStadiumStore((state) => state.selectedViewKind);
  const position = findViewingPosition(
    sectionId,
    row,
    positionNumber,
    viewKind,
  );

  if (!position) return null;

  const { metadata } = position;
  const distanceFromPitch = Math.hypot(
    metadata.position[0],
    metadata.position[2],
  );
  const isTerrace = position.kind === 'terrace';
  const sectionIndex = Number(metadata.sectionId.split('-')[1]) - 1;
  const tier = radesStadiumConfig.tiers.find(
    (candidate) => candidate.id === metadata.tierId,
  );
  const zone = tier
    ? getInteriorSectionZone(tier, sectionIndex, radesStadiumConfig.grandstand)
    : null;
  const isHonorTribune =
    !isTerrace &&
    radesStadiumConfig.grandstand.sectionIndices.includes(sectionIndex);

  return (
    <div className="seat-information" aria-live="polite">
      <span>
        {isTerrace
          ? 'Virage POV'
          : isHonorTribune
            ? 'Honor stand view'
            : (zone?.label ?? 'Selected seat')}
      </span>
      <strong>
        {metadata.sectionId} &middot; {isTerrace ? 'Terrace row' : 'Row'}{' '}
        {metadata.rowNumber} &middot; {isTerrace ? 'Position' : 'Seat'}{' '}
        {metadata.seatNumber}
      </strong>
      <small>
        Approx. {distanceFromPitch.toFixed(0)} m from pitch centre
        {isTerrace ? ' · representative terrace viewpoint' : ''}
      </small>
    </div>
  );
}
