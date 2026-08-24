import {
  BoxGeometry,
  Matrix4,
  Quaternion,
  SphereGeometry,
  Vector3,
  type BufferGeometry,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import type { EffectiveRenderQuality } from '../utils/useRenderQuality';

export type PersonPose = 'seated' | 'standing';

function createBox(
  size: [number, number, number],
  position: [number, number, number],
): BufferGeometry {
  const geometry = new BoxGeometry(...size);
  geometry.applyMatrix4(
    new Matrix4().compose(
      new Vector3(...position),
      new Quaternion(),
      new Vector3(1, 1, 1),
    ),
  );
  return geometry;
}

function mergeParts(parts: BufferGeometry[], label: string): BufferGeometry {
  const merged = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());

  if (!merged) {
    throw new Error(`Unable to create ${label} geometry.`);
  }

  merged.computeVertexNormals();
  merged.computeBoundingSphere();
  return merged;
}

export function createPersonBodyGeometry(
  pose: PersonPose,
  height: number,
): BufferGeometry {
  if (pose === 'seated') {
    return mergeParts(
      [
        createBox(
          [height * 0.3, height * 0.4, height * 0.16],
          [0, height * 0.68, 0],
        ),
        createBox(
          [height * 0.1, height * 0.09, height * 0.28],
          [-height * 0.085, height * 0.47, height * 0.12],
        ),
        createBox(
          [height * 0.1, height * 0.09, height * 0.28],
          [height * 0.085, height * 0.47, height * 0.12],
        ),
        createBox(
          [height * 0.1, height * 0.32, height * 0.1],
          [-height * 0.085, height * 0.27, height * 0.25],
        ),
        createBox(
          [height * 0.1, height * 0.32, height * 0.1],
          [height * 0.085, height * 0.27, height * 0.25],
        ),
      ],
      'seated person body',
    );
  }

  return mergeParts(
    [
      createBox(
        [height * 0.27, height * 0.4, height * 0.14],
        [0, height * 0.68, 0],
      ),
      createBox(
        [height * 0.1, height * 0.48, height * 0.11],
        [-height * 0.075, height * 0.26, 0],
      ),
      createBox(
        [height * 0.1, height * 0.48, height * 0.11],
        [height * 0.075, height * 0.26, 0],
      ),
      createBox(
        [height * 0.075, height * 0.37, height * 0.09],
        [-height * 0.19, height * 0.69, 0],
      ),
      createBox(
        [height * 0.075, height * 0.37, height * 0.09],
        [height * 0.19, height * 0.69, 0],
      ),
    ],
    'standing person body',
  );
}

export function createPersonHeadGeometry(
  pose: PersonPose,
  height: number,
  quality: EffectiveRenderQuality,
): BufferGeometry {
  const radius = height * (pose === 'seated' ? 0.105 : 0.085);
  const centerHeight = height * (pose === 'seated' ? 0.89 : 0.91);
  const geometry = new SphereGeometry(
    radius,
    quality === 'high' ? 8 : 6,
    quality === 'high' ? 6 : 4,
  );
  geometry.translate(0, centerHeight, 0);
  geometry.computeBoundingSphere();
  return geometry;
}
