import { useMemo } from 'react';

import { radesSeatLayout } from '../seats/seatMetadata';
import { isVisitorClosedSection } from '../seats/viewingPositions';
import { useStadiumStore } from '../state/useStadiumStore';

export function SeatSelector() {
  const selectedSectionId = useStadiumStore((state) => state.selectedSectionId);
  const selectedRow = useStadiumStore((state) => state.selectedRow);
  const selectedSeat = useStadiumStore((state) => state.selectedSeat);
  const selectRow = useStadiumStore((state) => state.selectRow);
  const selectSeat = useStadiumStore((state) => state.selectSeat);
  const seatsForSection = useMemo(
    () =>
      selectedSectionId
        ? radesSeatLayout.metadata.filter(
            (seat) => seat.sectionId === selectedSectionId,
          )
        : [],
    [selectedSectionId],
  );
  const rows = useMemo(
    () => [...new Set(seatsForSection.map((seat) => seat.rowNumber))],
    [seatsForSection],
  );
  const seatsForRow = useMemo(
    () =>
      selectedRow === null
        ? []
        : seatsForSection.filter((seat) => seat.rowNumber === selectedRow),
    [seatsForSection, selectedRow],
  );

  if (!selectedSectionId) {
    return null;
  }

  if (isVisitorClosedSection(selectedSectionId)) {
    return (
      <p className="seat-selector__terrace" role="status">
        Upper virage - closed to visitors.
      </p>
    );
  }

  if (seatsForSection.length === 0) {
    return (
      <p className="seat-selector__terrace" role="status">
        Virage terrace · no individual plastic seats in this section.
      </p>
    );
  }

  return (
    <div className="seat-selector" aria-label="Seat controls">
      <label>
        <span>Row</span>
        <select
          aria-label="Choose a row"
          value={selectedRow ?? ''}
          onChange={(event) => selectRow(Number(event.target.value))}
        >
          <option value="">Row</option>
          {rows.map((row) => (
            <option key={row} value={row}>
              {row}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Seat</span>
        <select
          aria-label="Choose a seat"
          disabled={selectedRow === null}
          value={selectedSeat ?? ''}
          onChange={(event) => {
            if (selectedRow !== null) {
              selectSeat(selectedRow, Number(event.target.value));
            }
          }}
        >
          <option value="">Seat</option>
          {seatsForRow.map((seat) => (
            <option key={seat.id} value={seat.seatNumber}>
              {seat.seatNumber}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
