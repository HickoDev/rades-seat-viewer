import { findSeat } from '../seats/seatMetadata';
import { useStadiumStore } from '../state/useStadiumStore';

export function SeatInformation() {
  const sectionId = useStadiumStore((state) => state.selectedSectionId);
  const row = useStadiumStore((state) => state.selectedRow);
  const seatNumber = useStadiumStore((state) => state.selectedSeat);
  const seat = findSeat(sectionId, row, seatNumber);

  if (!seat) return null;

  const distanceFromPitch = Math.hypot(seat.position[0], seat.position[2]);

  return (
    <div className="seat-information" aria-live="polite">
      <span>Selected seat</span>
      <strong>
        {seat.sectionId} · Row {seat.rowNumber} · Seat {seat.seatNumber}
      </strong>
      <small>Approx. {distanceFromPitch.toFixed(0)} m from pitch centre</small>
    </div>
  );
}
