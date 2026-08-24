import { findViewingPosition } from '../seats/viewingPositions';
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

  return (
    <div className="seat-information" aria-live="polite">
      <span>{isTerrace ? 'Virage POV' : 'Selected seat'}</span>
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
