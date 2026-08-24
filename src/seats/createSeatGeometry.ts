import { CapsuleGeometry, CylinderGeometry, type BufferGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import type { StadiumConfig } from '../stadium/types/stadium.types';

function createLowQualityParts(
  seats: StadiumConfig['seats'],
): BufferGeometry[] {
  const pan = new CylinderGeometry(1, 1, 1, 6, 1, false);
  pan.scale(seats.width / 2, 0.045, seats.depth / 2);
  pan.translate(0, seats.panHeight, 0.02);

  const back = new CylinderGeometry(1, 1, 1, 6, 1, false);
  back.scale(seats.width / 2, seats.backHeight, 0.0475);
  back.rotateX(-0.1);
  back.translate(
    0,
    seats.panHeight + seats.backHeight / 2,
    -seats.depth / 2 + 0.04,
  );
  return [pan, back];
}

function createHighQualityParts(
  seats: StadiumConfig['seats'],
): BufferGeometry[] {
  const edgeRadius = 0.075;
  const pan = new CapsuleGeometry(
    edgeRadius,
    seats.width - edgeRadius * 2,
    1,
    5,
  );
  pan.rotateZ(Math.PI / 2);
  pan.scale(1, 0.09 / (edgeRadius * 2), seats.depth / (edgeRadius * 2));
  pan.translate(0, seats.panHeight, 0.02);

  const back = new CapsuleGeometry(
    edgeRadius,
    seats.backHeight - edgeRadius * 2,
    1,
    5,
  );
  back.scale(seats.width / (edgeRadius * 2), 1, 0.095 / (edgeRadius * 2));
  back.rotateX(-0.1);
  back.translate(
    0,
    seats.panHeight + seats.backHeight / 2,
    -seats.depth / 2 + 0.04,
  );

  const pedestal = new CylinderGeometry(0.055, 0.075, seats.panHeight, 8);
  pedestal.translate(0, seats.panHeight / 2, 0);
  return [pan, back, pedestal];
}

export function createSeatGeometry(
  seats: StadiumConfig['seats'],
  quality: 'low' | 'high' = 'high',
): BufferGeometry {
  const parts =
    quality === 'high'
      ? createHighQualityParts(seats)
      : createLowQualityParts(seats);
  const normalizedParts = parts.map((part) =>
    part.index ? part.toNonIndexed() : part,
  );
  const merged = mergeGeometries(normalizedParts, false);
  normalizedParts.forEach((part, index) => {
    if (part !== parts[index]) part.dispose();
  });
  parts.forEach((part) => part.dispose());

  if (!merged) {
    throw new Error('Unable to create the shared seat geometry.');
  }

  merged.computeVertexNormals();
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  return merged;
}
