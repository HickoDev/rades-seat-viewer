import { describe, expect, it } from 'vitest';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { generateSeatLayout } from './generateSeatLayout';

const layout = generateSeatLayout(radesStadiumConfig);

describe('generateSeatLayout', () => {
  it('does not mistake stated capacity for an exact plastic-seat count', () => {
    expect(layout.metadata.length).toBeLessThan(
      radesStadiumConfig.identity.statedCapacity,
    );
    expect(layout.metadata.length).toBeGreaterThan(25_000);
  });

  it('leaves both configurable virage terraces without seat instances', () => {
    const seatlessIds = radesStadiumConfig.tiers.flatMap((tier) =>
      tier.seatlessSectionIndices.map(
        (sectionIndex) =>
          `${tier.id}-${String(sectionIndex + 1).padStart(2, '0')}`,
      ),
    );

    expect(
      layout.metadata.every((seat) => !seatlessIds.includes(seat.sectionId)),
    ).toBe(true);
  });

  it('generates unique seat ids associated with their section and tier', () => {
    const ids = new Set(layout.metadata.map((seat) => seat.id));

    expect(ids.size).toBe(layout.metadata.length);
    expect(
      layout.metadata.every(
        (seat) =>
          seat.id.startsWith(`${seat.sectionId}-`) &&
          seat.sectionId.startsWith(`${seat.tierId}-`),
      ),
    ).toBe(true);
  });

  it('raises successive rows', () => {
    const sectionSeats = layout.metadata.filter(
      (seat) => seat.sectionId === 'lower-05' && seat.seatNumber === 1,
    );

    expect(sectionSeats.length).toBeGreaterThan(2);
    expect(
      sectionSeats.slice(1).every((seat, index) => {
        const previous = sectionSeats[index];
        return seat.position[1] > previous.position[1];
      }),
    ).toBe(true);
  });

  it('keeps physical seat spacing approximately uniform within a row', () => {
    const seats = layout.metadata
      .filter((seat) => seat.sectionId === 'upper-09' && seat.rowNumber === 5)
      .slice(0, 12);
    const distances = seats.slice(1).map((seat, index) => {
      const previous = seats[index];
      return Math.hypot(
        seat.position[0] - previous.position[0],
        seat.position[2] - previous.position[2],
      );
    });

    expect(seats.length).toBe(12);
    expect(Math.max(...distances) / Math.min(...distances)).toBeLessThan(1.03);
  });
});
