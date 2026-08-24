import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';

import type { SeatMetadata } from '../seats/seat.types';
import { calculateSeatView } from './calculateSeatView';

const seat: SeatMetadata = {
  id: 'lower-01-r5-s3',
  sectionId: 'lower-01',
  tierId: 'lower',
  rowNumber: 5,
  seatNumber: 3,
  position: [82, 4.2, 8],
  rotationY: 0,
};

describe('calculateSeatView', () => {
  it('places the camera eye above the selected seat', () => {
    const view = calculateSeatView(seat, 1.2);

    expect(view.eyePosition.y).toBeCloseTo(seat.position[1] + 1.2, 6);
  });

  it('faces from the seat toward the pitch', () => {
    const view = calculateSeatView(seat, 1.2);
    const directionToPitch = new Vector3(0, 1.2, 0)
      .sub(view.eyePosition)
      .normalize();

    expect(view.viewingDirection.dot(directionToPitch)).toBeGreaterThan(0.999);
  });
});
