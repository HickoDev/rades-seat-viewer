import { Matrix4, Vector3 } from 'three';

import { createCylinderBetweenMatrix } from '../../utils/geometry';

export type RoofTrussMatrixOptions = {
  frameCount: number;
  innerRadiusX: number;
  innerRadiusZ: number;
  outerRadiusX: number;
  outerRadiusZ: number;
  innerHeight: number;
  outerHeight: number;
  panelThickness: number;
  innerTrussDepth: number;
  trussRadius: number;
};

function pointOnEllipse(
  angle: number,
  radiusX: number,
  radiusZ: number,
  height: number,
) {
  return new Vector3(
    Math.cos(angle) * radiusX,
    height,
    Math.sin(angle) * radiusZ,
  );
}

export function createRoofTrussMatrices({
  frameCount,
  innerRadiusX,
  innerRadiusZ,
  outerRadiusX,
  outerRadiusZ,
  innerHeight,
  outerHeight,
  panelThickness,
  innerTrussDepth,
  trussRadius,
}: RoofTrussMatrixOptions): Matrix4[] {
  const matrices: Matrix4[] = [];

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    const angle = (frameIndex / frameCount) * Math.PI * 2;
    const nextAngle = ((frameIndex + 1) / frameCount) * Math.PI * 2;
    const upperHeight = innerHeight - panelThickness * 0.45;
    const lowerHeight = upperHeight - innerTrussDepth;
    const upper = pointOnEllipse(
      angle,
      innerRadiusX,
      innerRadiusZ,
      upperHeight,
    );
    const nextUpper = pointOnEllipse(
      nextAngle,
      innerRadiusX,
      innerRadiusZ,
      upperHeight,
    );
    const lower = pointOnEllipse(
      angle,
      innerRadiusX + innerTrussDepth * 0.32,
      innerRadiusZ + innerTrussDepth * 0.32,
      lowerHeight,
    );
    const nextLower = pointOnEllipse(
      nextAngle,
      innerRadiusX + innerTrussDepth * 0.32,
      innerRadiusZ + innerTrussDepth * 0.32,
      lowerHeight,
    );
    const outer = pointOnEllipse(
      angle,
      outerRadiusX,
      outerRadiusZ,
      outerHeight - panelThickness,
    );

    matrices.push(
      createCylinderBetweenMatrix(upper, outer, trussRadius),
      createCylinderBetweenMatrix(lower, outer, trussRadius * 0.72),
      createCylinderBetweenMatrix(upper, nextUpper, trussRadius),
      createCylinderBetweenMatrix(lower, nextLower, trussRadius),
      createCylinderBetweenMatrix(upper, lower, trussRadius * 0.78),
      createCylinderBetweenMatrix(upper, nextLower, trussRadius * 0.78),
      createCylinderBetweenMatrix(lower, nextUpper, trussRadius * 0.72),
    );
  }

  return matrices;
}
