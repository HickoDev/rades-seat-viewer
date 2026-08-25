import { Vector3, type Matrix4 } from 'three';

import { createCylinderBetweenMatrix } from '../../utils/geometry';
import { getStadiumPerimeterPoint } from '../geometry/stadiumPerimeter';

export type RoofCatwalkRailOptions = {
  innerRadiusX: number;
  innerRadiusZ: number;
  width: number;
  height: number;
  railHeight: number;
  segmentCount: number;
  radius: number;
};

function perimeterPoint(
  angle: number,
  radiusX: number,
  radiusZ: number,
  height: number,
) {
  const point = getStadiumPerimeterPoint(angle, radiusX, radiusZ);
  return new Vector3(point.x, height, point.z);
}

export function createRoofCatwalkRailMatrices({
  innerRadiusX,
  innerRadiusZ,
  width,
  height,
  railHeight,
  segmentCount,
  radius,
}: RoofCatwalkRailOptions): Matrix4[] {
  const matrices: Matrix4[] = [];

  for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex += 1) {
    const angle = (segmentIndex / segmentCount) * Math.PI * 2;
    const nextAngle = ((segmentIndex + 1) / segmentCount) * Math.PI * 2;

    for (const offset of [0, width] as const) {
      const radiusX = innerRadiusX + offset;
      const radiusZ = innerRadiusZ + offset;
      const bottom = perimeterPoint(angle, radiusX, radiusZ, height);
      const top = perimeterPoint(angle, radiusX, radiusZ, height + railHeight);
      const nextTop = perimeterPoint(
        nextAngle,
        radiusX,
        radiusZ,
        height + railHeight,
      );
      matrices.push(
        createCylinderBetweenMatrix(bottom, top, radius),
        createCylinderBetweenMatrix(top, nextTop, radius),
      );
    }
  }

  return matrices;
}
