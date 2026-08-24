import { Object3D, Raycaster, Vector3 } from 'three';

import type { GeometricExposure } from './sunlight.types';

const rayOriginOffset = 0.05;

export function calculateSeatShadow(
  eyePosition: Vector3,
  directionTowardSun: Vector3,
  occluders: Object3D[],
): GeometricExposure {
  if (directionTowardSun.y <= 0) {
    return 'sun-below-horizon';
  }

  const direction = directionTowardSun.clone().normalize();
  const origin = eyePosition
    .clone()
    .addScaledVector(direction, rayOriginOffset);
  const raycaster = new Raycaster(origin, direction, 0, Infinity);
  raycaster.firstHitOnly = true;
  const intersections = raycaster.intersectObjects(occluders, true);

  return intersections.length > 0 ? 'stadium-shadow' : 'direct-sun';
}
