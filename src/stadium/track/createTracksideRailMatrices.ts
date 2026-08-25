import { Matrix4, Vector3 } from 'three';

import { createCylinderBetweenMatrix } from '../../utils/geometry';

export type TracksideRailOptions = {
  baseHeight: number;
  height: number;
  midRailRatio: number;
  radius: number;
  radiusX: number;
  radiusZ: number;
  segmentCount: number;
};

function pointOnRail(
  angle: number,
  height: number,
  radiusX: number,
  radiusZ: number,
) {
  return new Vector3(
    Math.cos(angle) * radiusX,
    height,
    Math.sin(angle) * radiusZ,
  );
}

export function createTracksideRailMatrices({
  baseHeight,
  height,
  midRailRatio,
  radius,
  radiusX,
  radiusZ,
  segmentCount,
}: TracksideRailOptions): Matrix4[] {
  const matrices: Matrix4[] = [];

  for (let index = 0; index < segmentCount; index += 1) {
    const angle = (index / segmentCount) * Math.PI * 2;
    const nextAngle = ((index + 1) / segmentCount) * Math.PI * 2;
    const base = pointOnRail(angle, baseHeight, radiusX, radiusZ);
    const top = pointOnRail(angle, baseHeight + height, radiusX, radiusZ);
    const mid = pointOnRail(
      angle,
      baseHeight + height * midRailRatio,
      radiusX,
      radiusZ,
    );
    const nextTop = pointOnRail(
      nextAngle,
      baseHeight + height,
      radiusX,
      radiusZ,
    );
    const nextMid = pointOnRail(
      nextAngle,
      baseHeight + height * midRailRatio,
      radiusX,
      radiusZ,
    );

    matrices.push(
      createCylinderBetweenMatrix(base, top, radius),
      createCylinderBetweenMatrix(mid, nextMid, radius),
      createCylinderBetweenMatrix(top, nextTop, radius),
    );
  }

  return matrices;
}
