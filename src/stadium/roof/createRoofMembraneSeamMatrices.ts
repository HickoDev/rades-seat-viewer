import { Matrix4, Vector3 } from 'three';

import { createCylinderBetweenMatrix } from '../../utils/geometry';

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
    return createCylinderBetweenMatrix(
      new Vector3(
        Math.cos(angle) * innerRadiusX,
        innerHeight + radius,
        Math.sin(angle) * innerRadiusZ,
      ),
      new Vector3(
        Math.cos(angle) * (outerRadiusX + wave * outerWaveRadius),
        outerHeight + wave * outerWaveHeight + radius,
        Math.sin(angle) * (outerRadiusZ + wave * outerWaveRadius),
      ),
      radius,
    );
  });
}
