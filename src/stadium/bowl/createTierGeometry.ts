import { BufferGeometry, Float32BufferAttribute } from 'three';

export type TierGeometryOptions = {
  startAngle: number;
  endAngle: number;
  startRadiusX: number;
  startRadiusZ: number;
  baseHeight: number;
  rowCount: number;
  rowDepth: number;
  rowHeight: number;
  angularSegments?: number;
};

function ellipsePoint(
  angle: number,
  radiusX: number,
  radiusZ: number,
  height: number,
): [number, number, number] {
  return [Math.cos(angle) * radiusX, height, Math.sin(angle) * radiusZ];
}

export function createTierGeometry({
  angularSegments = 8,
  baseHeight,
  endAngle,
  rowCount,
  rowDepth,
  rowHeight,
  startAngle,
  startRadiusX,
  startRadiusZ,
}: TierGeometryOptions): BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];

  const addQuad = (
    a: [number, number, number],
    b: [number, number, number],
    c: [number, number, number],
    d: [number, number, number],
  ) => {
    const offset = positions.length / 3;
    positions.push(...a, ...b, ...c, ...d);
    indices.push(
      offset,
      offset + 2,
      offset + 1,
      offset + 1,
      offset + 2,
      offset + 3,
    );
  };

  for (let row = 0; row < rowCount; row += 1) {
    const innerRadiusX = startRadiusX + row * rowDepth;
    const innerRadiusZ = startRadiusZ + row * rowDepth;
    const outerRadiusX = innerRadiusX + rowDepth;
    const outerRadiusZ = innerRadiusZ + rowDepth;
    const treadHeight = baseHeight + (row + 1) * rowHeight;
    const previousHeight = baseHeight + row * rowHeight;

    for (let segment = 0; segment < angularSegments; segment += 1) {
      const segmentStart =
        startAngle + ((endAngle - startAngle) * segment) / angularSegments;
      const segmentEnd =
        startAngle +
        ((endAngle - startAngle) * (segment + 1)) / angularSegments;

      addQuad(
        ellipsePoint(segmentStart, innerRadiusX, innerRadiusZ, treadHeight),
        ellipsePoint(segmentStart, outerRadiusX, outerRadiusZ, treadHeight),
        ellipsePoint(segmentEnd, innerRadiusX, innerRadiusZ, treadHeight),
        ellipsePoint(segmentEnd, outerRadiusX, outerRadiusZ, treadHeight),
      );

      addQuad(
        ellipsePoint(segmentStart, innerRadiusX, innerRadiusZ, previousHeight),
        ellipsePoint(segmentEnd, innerRadiusX, innerRadiusZ, previousHeight),
        ellipsePoint(segmentStart, innerRadiusX, innerRadiusZ, treadHeight),
        ellipsePoint(segmentEnd, innerRadiusX, innerRadiusZ, treadHeight),
      );
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

export type EllipticalRingOptions = {
  innerRadiusX: number;
  innerRadiusZ: number;
  outerRadiusX: number;
  outerRadiusZ: number;
  height: number;
  segments?: number;
};

export function createEllipticalRingGeometry({
  height,
  innerRadiusX,
  innerRadiusZ,
  outerRadiusX,
  outerRadiusZ,
  segments = 192,
}: EllipticalRingOptions): BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];

  for (let index = 0; index <= segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    positions.push(
      ...ellipsePoint(angle, innerRadiusX, innerRadiusZ, height),
      ...ellipsePoint(angle, outerRadiusX, outerRadiusZ, height),
    );

    if (index < segments) {
      const base = index * 2;
      indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}
