import { Matrix4, Vector3 } from 'three';

import { createCylinderBetweenMatrix } from '../../utils/geometry';

export type PlayerTunnelFrameOptions = {
  eaveHeight: number;
  frameCount: number;
  frameRadius: number;
  length: number;
  ridgeHeight: number;
  width: number;
};

export type PlayerTunnelFrameLayout = {
  frameMembers: Matrix4[];
  wheelPositions: Vector3[];
};

export function createPlayerTunnelFrameMatrices({
  eaveHeight,
  frameCount,
  frameRadius,
  length,
  ridgeHeight,
  width,
}: PlayerTunnelFrameOptions): PlayerTunnelFrameLayout {
  const frameMembers: Matrix4[] = [];
  const wheelPositions: Vector3[] = [];
  const wheelRadius = frameRadius * 3.2;
  const baseHeight = wheelRadius * 1.7;
  const bayLength = length / (frameCount - 1);
  const halfWidth = width / 2;

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    const z = -length / 2 + frameIndex * bayLength;

    for (const side of [-1, 1] as const) {
      const x = side * halfWidth;
      frameMembers.push(
        createCylinderBetweenMatrix(
          new Vector3(x, baseHeight, z),
          new Vector3(x, eaveHeight, z),
          frameRadius,
        ),
        createCylinderBetweenMatrix(
          new Vector3(x, eaveHeight, z),
          new Vector3(0, ridgeHeight, z),
          frameRadius,
        ),
      );
      wheelPositions.push(new Vector3(x, wheelRadius, z));
    }

    if (frameIndex === frameCount - 1) continue;
    const nextZ = z + bayLength;
    for (const side of [-1, 1] as const) {
      const x = side * halfWidth;
      frameMembers.push(
        createCylinderBetweenMatrix(
          new Vector3(x, eaveHeight * 0.22, z),
          new Vector3(x, eaveHeight * 0.7, nextZ),
          frameRadius * 0.72,
        ),
        createCylinderBetweenMatrix(
          new Vector3(x, eaveHeight * 0.7, z),
          new Vector3(x, eaveHeight * 0.22, nextZ),
          frameRadius * 0.72,
        ),
      );
    }
  }

  return { frameMembers, wheelPositions };
}
