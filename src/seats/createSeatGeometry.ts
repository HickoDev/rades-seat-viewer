import { BoxGeometry, type BufferGeometry } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import type { StadiumConfig } from '../stadium/types/stadium.types';

export function createSeatGeometry(
  seats: StadiumConfig['seats'],
  quality: 'low' | 'high' = 'high',
): BufferGeometry {
  const pan = new BoxGeometry(seats.width, 0.08, seats.depth);
  pan.translate(0, seats.panHeight, 0.02);

  const back = new BoxGeometry(seats.width, seats.backHeight, 0.08);
  back.translate(
    0,
    seats.panHeight + seats.backHeight / 2,
    -seats.depth / 2 + 0.04,
  );

  const parts = [pan, back];
  let pedestal: BoxGeometry | null = null;
  if (quality === 'high') {
    pedestal = new BoxGeometry(0.12, seats.panHeight, 0.12);
    pedestal.translate(0, seats.panHeight / 2, 0);
    parts.push(pedestal);
  }

  const merged = mergeGeometries(parts, false);
  pan.dispose();
  back.dispose();
  pedestal?.dispose();

  if (!merged) {
    throw new Error('Unable to create the shared seat geometry.');
  }

  merged.computeVertexNormals();
  return merged;
}
