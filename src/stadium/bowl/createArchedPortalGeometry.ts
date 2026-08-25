import { ExtrudeGeometry, Path, Shape } from 'three';

export type ArchedPortalGeometryOptions = {
  frameThickness?: number;
};

function addArchOutline(
  path: Shape | Path,
  left: number,
  right: number,
  bottom: number,
  shoulder: number,
  top: number,
  clockwise: boolean,
) {
  const halfWidth = (right - left) / 2;
  const controlOffset = halfWidth * 0.55;

  if (!clockwise) {
    path.moveTo(left, bottom);
    path.lineTo(right, bottom);
    path.lineTo(right, shoulder);
    path.bezierCurveTo(right, top - controlOffset, controlOffset, top, 0, top);
    path.bezierCurveTo(
      -controlOffset,
      top,
      left,
      top - controlOffset,
      left,
      shoulder,
    );
    path.closePath();
    return;
  }

  path.moveTo(left, bottom);
  path.lineTo(left, shoulder);
  path.bezierCurveTo(left, top - controlOffset, -controlOffset, top, 0, top);
  path.bezierCurveTo(
    controlOffset,
    top,
    right,
    top - controlOffset,
    right,
    shoulder,
  );
  path.lineTo(right, bottom);
  path.closePath();
}

/**
 * Unit arched bay for instancing around the middle concourse. Supplying a
 * frame thickness creates a stone surround with a true arched opening.
 */
export function createArchedPortalGeometry({
  frameThickness = 0,
}: ArchedPortalGeometryOptions = {}) {
  const shape = new Shape();
  addArchOutline(shape, -0.5, 0.5, -0.5, 0.08, 0.5, false);

  if (frameThickness > 0) {
    const inset = Math.min(Math.max(frameThickness, 0.02), 0.2);
    const hole = new Path();
    addArchOutline(
      hole,
      -0.5 + inset,
      0.5 - inset,
      -0.5 + inset,
      0.08,
      0.5 - inset,
      true,
    );
    shape.holes.push(hole);
  }

  const geometry = new ExtrudeGeometry(shape, {
    bevelEnabled: false,
    curveSegments: 12,
    depth: 1,
    steps: 1,
  });
  geometry.translate(0, 0, -0.5);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
