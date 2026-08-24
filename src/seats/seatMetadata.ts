import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { generateSeatLayout } from './generateSeatLayout';
import type { SeatMetadata } from './seat.types';

export const radesSeatLayout = generateSeatLayout(radesStadiumConfig);

export function findSeat(
  sectionId: string | null,
  rowNumber: number | null,
  seatNumber: number | null,
): SeatMetadata | null {
  if (!sectionId || rowNumber === null || seatNumber === null) {
    return null;
  }

  return (
    radesSeatLayout.metadata.find(
      (seat) =>
        seat.sectionId === sectionId &&
        seat.rowNumber === rowNumber &&
        seat.seatNumber === seatNumber,
    ) ?? null
  );
}
