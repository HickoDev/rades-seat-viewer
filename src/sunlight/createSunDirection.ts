import { Vector3 } from 'three';

export function createSunDirection(
  altitudeRadians: number,
  northClockwiseAzimuthRadians: number,
  northRotationDegrees: number,
): Vector3 {
  const northRotation = (northRotationDegrees * Math.PI) / 180;
  const north = new Vector3(
    Math.sin(northRotation),
    0,
    Math.cos(northRotation),
  );
  const east = new Vector3(
    Math.cos(northRotation),
    0,
    -Math.sin(northRotation),
  );
  const horizontalMagnitude = Math.cos(altitudeRadians);
  const northMagnitude =
    Math.cos(northClockwiseAzimuthRadians) * horizontalMagnitude;
  const eastMagnitude =
    Math.sin(northClockwiseAzimuthRadians) * horizontalMagnitude;

  return north
    .multiplyScalar(northMagnitude)
    .add(east.multiplyScalar(eastMagnitude))
    .add(new Vector3(0, Math.sin(altitudeRadians), 0))
    .normalize();
}
