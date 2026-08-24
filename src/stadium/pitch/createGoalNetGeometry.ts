import { BufferGeometry, Float32BufferAttribute } from 'three';

export type GoalNetGeometryOptions = {
  side: -1 | 1;
  goalLineX: number;
  width: number;
  height: number;
  groundDepth: number;
  topDepth: number;
  gridSpacing: number;
};

function divisionsFor(distance: number, spacing: number) {
  return Math.max(1, Math.ceil(distance / spacing));
}

export function createGoalNetGeometry({
  side,
  goalLineX,
  width,
  height,
  groundDepth,
  topDepth,
  gridSpacing,
}: GoalNetGeometryOptions): BufferGeometry {
  const positions: number[] = [];
  const frontX = side * goalLineX;
  const backGroundX = frontX + side * groundDepth;
  const backTopX = frontX + side * topDepth;
  const halfWidth = width / 2;
  const widthDivisions = divisionsFor(width, gridSpacing);
  const heightDivisions = divisionsFor(height, gridSpacing);
  const depthDivisions = divisionsFor(groundDepth, gridSpacing);
  const topDepthDivisions = divisionsFor(topDepth, gridSpacing);

  const addSegment = (
    start: [number, number, number],
    end: [number, number, number],
  ) => positions.push(...start, ...end);

  for (let index = 0; index <= widthDivisions; index += 1) {
    const z = -halfWidth + (index / widthDivisions) * width;
    addSegment([backGroundX, 0, z], [backTopX, height, z]);
    addSegment([frontX, height, z], [backTopX, height, z]);
  }

  for (let index = 0; index <= heightDivisions; index += 1) {
    const ratio = index / heightDivisions;
    const y = ratio * height;
    const backX = backGroundX + (backTopX - backGroundX) * ratio;
    addSegment([backX, y, -halfWidth], [backX, y, halfWidth]);

    ([-1, 1] as const).forEach((zSide) =>
      addSegment([frontX, y, zSide * halfWidth], [backX, y, zSide * halfWidth]),
    );
  }

  for (let index = 0; index <= depthDivisions; index += 1) {
    const ratio = index / depthDivisions;
    const groundX = frontX + (backGroundX - frontX) * ratio;
    const topX = frontX + (backTopX - frontX) * ratio;
    ([-1, 1] as const).forEach((zSide) =>
      addSegment(
        [groundX, 0, zSide * halfWidth],
        [topX, height, zSide * halfWidth],
      ),
    );
  }

  for (let index = 0; index <= topDepthDivisions; index += 1) {
    const ratio = index / topDepthDivisions;
    const x = frontX + (backTopX - frontX) * ratio;
    addSegment([x, height, -halfWidth], [x, height, halfWidth]);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
