import { Matrix4, Vector3 } from 'three';

import { createCylinderBetweenMatrix } from '../../utils/geometry';

export type ExteriorBraceOptions = {
  bayCount: number;
  radiusX: number;
  radiusZ: number;
  bottomHeight: number;
  topHeight: number;
  radius: number;
};

function ellipsePoint(
  angle: number,
  radiusX: number,
  radiusZ: number,
  height: number,
): Vector3 {
  return new Vector3(
    Math.cos(angle) * radiusX,
    height,
    Math.sin(angle) * radiusZ,
  );
}

export function createExteriorBraceMatrices({
  bayCount,
  bottomHeight,
  radius,
  radiusX,
  radiusZ,
  topHeight,
}: ExteriorBraceOptions): Matrix4[] {
  return Array.from({ length: bayCount }, (_, bayIndex) => {
    const startAngle = (bayIndex / bayCount) * Math.PI * 2;
    const endAngle = ((bayIndex + 1) / bayCount) * Math.PI * 2;
    return [
      createCylinderBetweenMatrix(
        ellipsePoint(startAngle, radiusX, radiusZ, bottomHeight),
        ellipsePoint(endAngle, radiusX, radiusZ, topHeight),
        radius,
      ),
      createCylinderBetweenMatrix(
        ellipsePoint(startAngle, radiusX, radiusZ, topHeight),
        ellipsePoint(endAngle, radiusX, radiusZ, bottomHeight),
        radius,
      ),
    ];
  }).flat();
}
