import { Matrix4, Vector3 } from 'three';

import { createCylinderBetweenMatrix } from '../../utils/geometry';
import { getStadiumPerimeterPoint } from '../geometry/stadiumPerimeter';

export type RoofMembraneSeamOptions = {
  seamCount: number;
  innerRadiusX: number;
  innerRadiusZ: number;
  outerRadiusX: number;
  outerRadiusZ: number;
  innerHeight: number;
  outerHeight: number;
  outerWaveHeight: number;
  outerWaveRadius: number;
  radius: number;
};

export function createRoofMembraneSeamMatrices({
  innerHeight,
  innerRadiusX,
  innerRadiusZ,
  outerHeight,
  outerRadiusX,
  outerRadiusZ,
  outerWaveHeight,
  outerWaveRadius,
  radius,
  seamCount,
}: RoofMembraneSeamOptions): Matrix4[] {
  return Array.from({ length: seamCount }, (_, seamIndex) => {
    const angle = (seamIndex / seamCount) * Math.PI * 2;
    const wave = Math.cos(angle * seamCount);
    const inner = getStadiumPerimeterPoint(angle, innerRadiusX, innerRadiusZ);
    const outer = getStadiumPerimeterPoint(
      angle,
      outerRadiusX + wave * outerWaveRadius,
      outerRadiusZ + wave * outerWaveRadius,
    );
    return createCylinderBetweenMatrix(
      new Vector3(inner.x, innerHeight + radius, inner.z),
      new Vector3(
        outer.x,
        outerHeight + wave * outerWaveHeight + radius,
        outer.z,
      ),
      radius,
    );
  });
}
