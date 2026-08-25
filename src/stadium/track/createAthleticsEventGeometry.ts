import { MathUtils, Shape, ShapeGeometry } from 'three';

export type AthleticsEventApronOptions = {
  curveRadius: number;
  pitchLength: number;
  startOffset: number;
  straightLength: number;
};

/**
 * Creates the right-hand circular segment inside a track bend. The opposite
 * apron is produced by mirroring this independently generated geometry.
 */
export function createAthleticsEventApronGeometry({
  curveRadius,
  pitchLength,
  startOffset,
  straightLength,
}: AthleticsEventApronOptions) {
  const curveCenterX = straightLength / 2;
  const startX = pitchLength / 2 + startOffset;
  const centerOffset = MathUtils.clamp(
    startX - curveCenterX,
    0,
    curveRadius - 0.01,
  );
  const boundaryAngle = Math.acos(centerOffset / curveRadius);
  const zExtent = Math.sin(boundaryAngle) * curveRadius;
  const shape = new Shape();

  shape.moveTo(startX, -zExtent);
  shape.lineTo(startX, zExtent);
  shape.absarc(
    curveCenterX,
    0,
    curveRadius,
    boundaryAngle,
    -boundaryAngle,
    true,
  );
  shape.closePath();

  const geometry = new ShapeGeometry(shape, 48);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
