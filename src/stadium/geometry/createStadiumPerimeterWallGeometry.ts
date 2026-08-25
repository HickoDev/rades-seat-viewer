import { BufferGeometry, Float32BufferAttribute } from 'three';

import { getStadiumPerimeterPoint } from './stadiumPerimeter';

export type StadiumPerimeterWallOptions = {
  bottom: number;
  extentX: number;
  extentZ: number;
  height: number;
  segments?: number;
  gapAngle?: number;
  gapCenterAngle?: number;
};

function angularDistance(first: number, second: number) {
  return Math.abs(
    Math.atan2(Math.sin(first - second), Math.cos(first - second)),
  );
}

export function createStadiumPerimeterWallGeometry({
  bottom,
  extentX,
  extentZ,
  gapAngle = 0,
  gapCenterAngle = 0,
  height,
  segments = 192,
}: StadiumPerimeterWallOptions): BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];

  for (let index = 0; index < segments; index += 1) {
    const startAngle = (index / segments) * Math.PI * 2;
    const endAngle = ((index + 1) / segments) * Math.PI * 2;
    const midpointAngle = (startAngle + endAngle) / 2;
    if (
      gapAngle > 0 &&
      angularDistance(midpointAngle, gapCenterAngle) < gapAngle / 2
    ) {
      continue;
    }

    const start = getStadiumPerimeterPoint(startAngle, extentX, extentZ);
    const end = getStadiumPerimeterPoint(endAngle, extentX, extentZ);
    const offset = positions.length / 3;
    positions.push(
      start.x,
      bottom,
      start.z,
      end.x,
      bottom,
      end.z,
      start.x,
      bottom + height,
      start.z,
      end.x,
      bottom + height,
      end.z,
    );
    indices.push(
      offset,
      offset + 1,
      offset + 2,
      offset + 2,
      offset + 1,
      offset + 3,
    );
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
