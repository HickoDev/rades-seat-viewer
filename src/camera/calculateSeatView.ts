import { Vector3 } from 'three';

import type { SeatMetadata } from '../seats/seat.types';

export type SeatView = {
  eyePosition: Vector3;
  pitchTarget: Vector3;
  viewingDirection: Vector3;
};

export function calculateSeatView(
  seat: SeatMetadata,
  eyeHeight: number,
): SeatView {
  const eyePosition = new Vector3(...seat.position).add(
    new Vector3(0, eyeHeight, 0),
  );
  const pitchTarget = new Vector3(0, 1.2, 0);
  const viewingDirection = pitchTarget.clone().sub(eyePosition).normalize();

  return { eyePosition, pitchTarget, viewingDirection };
}
