import { Shape, ShapeGeometry } from 'three';

export function createCapsuleInfieldGeometry(
  curveRadius: number,
  straightLength: number,
  curveSegments = 64,
) {
  const halfStraight = straightLength / 2;
  const shape = new Shape();
  shape.moveTo(-halfStraight, -curveRadius);
  shape.lineTo(halfStraight, -curveRadius);
  shape.absarc(halfStraight, 0, curveRadius, -Math.PI / 2, Math.PI / 2, false);
  shape.lineTo(-halfStraight, curveRadius);
  shape.absarc(
    -halfStraight,
    0,
    curveRadius,
    Math.PI / 2,
    (Math.PI * 3) / 2,
    false,
  );
  shape.closePath();
  const geometry = new ShapeGeometry(shape, curveSegments);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
