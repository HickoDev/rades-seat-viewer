import {
  BoxGeometry,
  CylinderGeometry,
  Matrix4,
  Quaternion,
  SphereGeometry,
  Vector3,
  type BufferGeometry,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import type { EffectiveRenderQuality } from '../utils/useRenderQuality';

export type PersonPose = 'seated' | 'standing' | 'athletic';

const upAxis = new Vector3(0, 1, 0);

function createBox(
  size: [number, number, number],
  position: [number, number, number],
): BufferGeometry {
  const geometry = new BoxGeometry(...size);
  geometry.translate(...position);
  return geometry;
}

function createTaperedBody(
  height: number,
  centerHeightRatio: number,
  lengthRatio: number,
  radiusTopRatio: number,
  radiusBottomRatio: number,
  radialSegments: number,
): BufferGeometry {
  const geometry = new CylinderGeometry(
    height * radiusTopRatio,
    height * radiusBottomRatio,
    height * lengthRatio,
    radialSegments,
    1,
    false,
  );
  geometry.applyMatrix4(
    new Matrix4().compose(
      new Vector3(0, height * centerHeightRatio, 0),
      new Quaternion(),
      new Vector3(1, 1, 0.62),
    ),
  );
  return geometry;
}

function createLimb(
  height: number,
  startRatio: [number, number, number],
  endRatio: [number, number, number],
  radiusRatio: number,
  radialSegments: number,
): BufferGeometry {
  const start = new Vector3(...startRatio).multiplyScalar(height);
  const end = new Vector3(...endRatio).multiplyScalar(height);
  const direction = end.clone().sub(start);
  const length = direction.length();
  const geometry = new CylinderGeometry(
    height * radiusRatio * 0.86,
    height * radiusRatio,
    length,
    radialSegments,
    1,
    false,
  );
  geometry.applyMatrix4(
    new Matrix4().compose(
      start.add(end).multiplyScalar(0.5),
      new Quaternion().setFromUnitVectors(upAxis, direction.normalize()),
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
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  return merged;
}

export function createPersonBodyGeometry(
  pose: PersonPose,
  height: number,
): BufferGeometry {
  const radialSegments = 6;
  const parts: BufferGeometry[] = [
    createTaperedBody(height, 0.69, 0.34, 0.145, 0.105, radialSegments),
  ];

  if (pose === 'seated') {
    parts.push(
      createLimb(
        height,
        [-0.115, 0.76, 0],
        [-0.15, 0.6, 0.08],
        0.034,
        radialSegments,
      ),
      createLimb(
        height,
        [-0.15, 0.6, 0.08],
        [-0.105, 0.5, 0.19],
        0.03,
        radialSegments,
      ),
      createLimb(
        height,
        [0.115, 0.76, 0],
        [0.15, 0.6, 0.08],
        0.034,
        radialSegments,
      ),
      createLimb(
        height,
        [0.15, 0.6, 0.08],
        [0.105, 0.5, 0.19],
        0.03,
        radialSegments,
      ),
      createLimb(
        height,
        [-0.075, 0.5, 0.015],
        [-0.085, 0.43, 0.23],
        0.047,
        radialSegments,
      ),
      createLimb(
        height,
        [-0.085, 0.43, 0.23],
        [-0.085, 0.17, 0.27],
        0.043,
        radialSegments,
      ),
      createLimb(
        height,
        [0.075, 0.5, 0.015],
        [0.085, 0.43, 0.23],
        0.047,
        radialSegments,
      ),
      createLimb(
        height,
        [0.085, 0.43, 0.23],
        [0.085, 0.17, 0.27],
        0.043,
        radialSegments,
      ),
      createBox(
        [height * 0.1, height * 0.055, height * 0.16],
        [-height * 0.085, height * 0.08, height * 0.315],
      ),
      createBox(
        [height * 0.1, height * 0.055, height * 0.16],
        [height * 0.085, height * 0.08, height * 0.315],
      ),
    );
  } else {
    const athletic = pose === 'athletic';
    const leftKneeZ = athletic ? 0.055 : 0;
    const rightKneeZ = athletic ? -0.045 : 0;
    const leftFootZ = athletic ? 0.13 : 0.035;
    const rightFootZ = athletic ? -0.1 : 0.035;

    parts.push(
      createLimb(
        height,
        [-0.105, 0.78, 0],
        [-0.17, 0.62, athletic ? -0.065 : 0.015],
        0.032,
        radialSegments,
      ),
      createLimb(
        height,
        [-0.17, 0.62, athletic ? -0.065 : 0.015],
        [-0.13, 0.48, athletic ? -0.11 : 0.025],
        0.028,
        radialSegments,
      ),
      createLimb(
        height,
        [0.105, 0.78, 0],
        [0.17, 0.62, athletic ? 0.065 : 0.015],
        0.032,
        radialSegments,
      ),
      createLimb(
        height,
        [0.17, 0.62, athletic ? 0.065 : 0.015],
        [0.13, 0.48, athletic ? 0.11 : 0.025],
        0.028,
        radialSegments,
      ),
      createLimb(
        height,
        [-0.065, 0.51, 0],
        [-0.075, 0.28, leftKneeZ],
        0.046,
        radialSegments,
      ),
      createLimb(
        height,
        [-0.075, 0.28, leftKneeZ],
        [-0.075, 0.065, leftFootZ],
        0.041,
        radialSegments,
      ),
      createLimb(
        height,
        [0.065, 0.51, 0],
        [0.075, 0.28, rightKneeZ],
        0.046,
        radialSegments,
      ),
      createLimb(
        height,
        [0.075, 0.28, rightKneeZ],
        [0.075, 0.065, rightFootZ],
        0.041,
        radialSegments,
      ),
      createBox(
        [height * 0.105, height * 0.055, height * 0.17],
        [-height * 0.075, height * 0.035, height * (leftFootZ + 0.035)],
      ),
      createBox(
        [height * 0.105, height * 0.055, height * 0.17],
        [height * 0.075, height * 0.035, height * (rightFootZ + 0.035)],
      ),
    );
  }

  return mergeParts(parts, `${pose} person body`);
}

export function createPersonHeadGeometry(
  pose: PersonPose,
  height: number,
  quality: EffectiveRenderQuality,
): BufferGeometry {
  const seated = pose === 'seated';
  const radius = height * (seated ? 0.1 : 0.085);
  const centerHeight = height * (seated ? 0.91 : 0.92);
  const geometry = new SphereGeometry(
    radius,
    quality === 'high' ? 10 : 7,
    quality === 'high' ? 7 : 5,
  );
  geometry.scale(0.92, 1.08, 0.96);
  geometry.translate(0, centerHeight, 0);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
