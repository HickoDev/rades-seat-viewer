import {
  CapsuleGeometry,
  CylinderGeometry,
  LatheGeometry,
  Matrix4,
  Quaternion,
  Vector2,
  Vector3,
  type BufferGeometry,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import type { EffectiveRenderQuality } from '../utils/useRenderQuality';

export type PersonPose = 'seated' | 'standing' | 'athletic';

const upAxis = new Vector3(0, 1, 0);

type ProfilePoint = [radiusRatio: number, heightRatio: number];

function createLathedVolume(
  height: number,
  profile: ProfilePoint[],
  radialSegments: number,
  depthScale = 1,
): BufferGeometry {
  const geometry = new LatheGeometry(
    profile.map(
      ([radiusRatio, heightRatio]) =>
        new Vector2(radiusRatio * height, heightRatio * height),
    ),
    radialSegments,
  );
  geometry.scale(1, 1, depthScale);
  return geometry;
}

function createCapsuleBetween(
  height: number,
  startRatio: [number, number, number],
  endRatio: [number, number, number],
  radiusRatio: number,
  radialSegments: number,
): BufferGeometry {
  const start = new Vector3(...startRatio).multiplyScalar(height);
  const end = new Vector3(...endRatio).multiplyScalar(height);
  const direction = end.clone().sub(start);
  const totalLength = direction.length();
  const radius = height * radiusRatio;
  const geometry: BufferGeometry =
    radialSegments <= 4
      ? new CylinderGeometry(
          radius * 0.84,
          radius,
          totalLength,
          radialSegments,
          1,
          false,
        )
      : new CapsuleGeometry(
          radius,
          Math.max(0.001, totalLength - radius * 2),
          radialSegments <= 5 ? 1 : 2,
          radialSegments,
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

function createTorso(height: number, radialSegments: number): BufferGeometry {
  return createLathedVolume(
    height,
    [
      [0, 0.5],
      [0.102, 0.515],
      [0.122, 0.59],
      [0.145, 0.76],
      [0.108, 0.855],
      [0, 0.865],
    ],
    radialSegments,
    0.62,
  );
}

function createPelvis(height: number, radialSegments: number): BufferGeometry {
  return createLathedVolume(
    height,
    [
      [0, 0.455],
      [0.092, 0.462],
      [0.108, 0.495],
      [0.104, 0.535],
      [0, 0.545],
    ],
    radialSegments,
    0.72,
  );
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

function createSeatedBodyParts(
  height: number,
  radialSegments: number,
): BufferGeometry[] {
  return [
    createCapsuleBetween(
      height,
      [-0.115, 0.76, 0],
      [-0.15, 0.6, 0.08],
      0.033,
      radialSegments,
    ),
    createCapsuleBetween(
      height,
      [-0.15, 0.6, 0.08],
      [-0.105, 0.5, 0.19],
      0.029,
      radialSegments,
    ),
    createCapsuleBetween(
      height,
      [0.115, 0.76, 0],
      [0.15, 0.6, 0.08],
      0.033,
      radialSegments,
    ),
    createCapsuleBetween(
      height,
      [0.15, 0.6, 0.08],
      [0.105, 0.5, 0.19],
      0.029,
      radialSegments,
    ),
    createCapsuleBetween(
      height,
      [-0.075, 0.5, 0.015],
      [-0.085, 0.43, 0.23],
      0.046,
      radialSegments,
    ),
    createCapsuleBetween(
      height,
      [-0.085, 0.43, 0.23],
      [-0.085, 0.17, 0.27],
      0.041,
      radialSegments,
    ),
    createCapsuleBetween(
      height,
      [0.075, 0.5, 0.015],
      [0.085, 0.43, 0.23],
      0.046,
      radialSegments,
    ),
    createCapsuleBetween(
      height,
      [0.085, 0.43, 0.23],
      [0.085, 0.17, 0.27],
      0.041,
      radialSegments,
    ),
    createCapsuleBetween(
      height,
      [-0.085, 0.085, 0.275],
      [-0.085, 0.085, 0.37],
      0.037,
      radialSegments,
    ),
    createCapsuleBetween(
      height,
      [0.085, 0.085, 0.275],
      [0.085, 0.085, 0.37],
      0.037,
      radialSegments,
    ),
  ];
}

function createUprightBodyParts(
  pose: 'standing' | 'athletic',
  height: number,
  radialSegments: number,
): BufferGeometry[] {
  const athletic = pose === 'athletic';
  const leftKneeZ = athletic ? 0.055 : 0;
  const rightKneeZ = athletic ? -0.045 : 0;
  const leftFootZ = athletic ? 0.13 : 0.035;
  const rightFootZ = athletic ? -0.1 : 0.035;

  return [
    createCapsuleBetween(
      height,
      [-0.105, 0.78, 0],
      [-0.17, 0.62, athletic ? -0.065 : 0.015],
      0.031,
      radialSegments,
    ),
    createCapsuleBetween(
      height,
      [-0.17, 0.62, athletic ? -0.065 : 0.015],
      [-0.13, 0.48, athletic ? -0.11 : 0.025],
      0.027,
      radialSegments,
    ),
    createCapsuleBetween(
      height,
      [0.105, 0.78, 0],
      [0.17, 0.62, athletic ? 0.065 : 0.015],
      0.031,
      radialSegments,
    ),
    createCapsuleBetween(
      height,
      [0.17, 0.62, athletic ? 0.065 : 0.015],
      [0.13, 0.48, athletic ? 0.11 : 0.025],
      0.027,
      radialSegments,
    ),
    createCapsuleBetween(
      height,
      [-0.065, 0.51, 0],
      [-0.075, 0.28, leftKneeZ],
      0.044,
      radialSegments,
    ),
    createCapsuleBetween(
      height,
      [-0.075, 0.28, leftKneeZ],
      [-0.075, 0.065, leftFootZ],
      0.039,
      radialSegments,
    ),
    createCapsuleBetween(
      height,
      [0.065, 0.51, 0],
      [0.075, 0.28, rightKneeZ],
      0.044,
      radialSegments,
    ),
    createCapsuleBetween(
      height,
      [0.075, 0.28, rightKneeZ],
      [0.075, 0.065, rightFootZ],
      0.039,
      radialSegments,
    ),
    createCapsuleBetween(
      height,
      [-0.075, 0.04, leftFootZ],
      [-0.075, 0.04, leftFootZ + 0.1],
      0.036,
      radialSegments,
    ),
    createCapsuleBetween(
      height,
      [0.075, 0.04, rightFootZ],
      [0.075, 0.04, rightFootZ + 0.1],
      0.036,
      radialSegments,
    ),
  ];
}

export function createPersonBodyGeometry(
  pose: PersonPose,
  height: number,
  quality: EffectiveRenderQuality = 'high',
): BufferGeometry {
  const radialSegments = quality === 'high' ? 6 : 4;
  const parts = [createTorso(height, radialSegments), createPelvis(height, 6)];
  parts.push(
    ...(pose === 'seated'
      ? createSeatedBodyParts(height, radialSegments)
      : createUprightBodyParts(pose, height, radialSegments)),
  );
  return mergeParts(parts, `${pose} person body`);
}

export function createPersonHeadGeometry(
  pose: PersonPose,
  height: number,
  quality: EffectiveRenderQuality,
): BufferGeometry {
  const seated = pose === 'seated';
  const centerHeight = seated ? 0.89 : 0.91;
  const radius = seated ? 0.1 : 0.085;
  const radialSegments = quality === 'high' ? 10 : 6;
  const head = createLathedVolume(
    height,
    [
      [0, centerHeight - radius * 0.8],
      [radius * 0.5, centerHeight - radius * 0.86],
      [radius * 0.82, centerHeight - radius * 0.56],
      [radius, centerHeight - radius * 0.05],
      [radius * 0.94, centerHeight + radius * 0.5],
      [radius * 0.7, centerHeight + radius * 0.82],
      [radius * 0.28, centerHeight + radius],
      [0, centerHeight + radius * 1.02],
    ],
    radialSegments,
    0.94,
  );
  const neck = createCapsuleBetween(
    height,
    [0, seated ? 0.79 : 0.82, 0],
    [0, seated ? 0.85 : 0.875, 0],
    0.033,
    radialSegments,
  );
  const handEndpoints =
    pose === 'seated'
      ? ([
          [-0.105, 0.5, 0.19],
          [0.105, 0.5, 0.19],
        ] as const)
      : pose === 'athletic'
        ? ([
            [-0.13, 0.48, -0.11],
            [0.13, 0.48, 0.11],
          ] as const)
        : ([
            [-0.13, 0.48, 0.025],
            [0.13, 0.48, 0.025],
          ] as const);
  const hands = handEndpoints.map(([x, y, z]) =>
    createCapsuleBetween(
      height,
      [x, y - 0.012, z],
      [x, y + 0.018, z + 0.012],
      0.027,
      radialSegments,
    ),
  );

  return mergeParts([head, neck, ...hands], `${pose} person skin`);
}

export function createPersonHairGeometry(
  pose: PersonPose,
  height: number,
  quality: EffectiveRenderQuality,
): BufferGeometry {
  const seated = pose === 'seated';
  const centerHeight = seated ? 0.89 : 0.91;
  const radius = seated ? 0.102 : 0.087;
  const geometry = createLathedVolume(
    height,
    [
      [0, centerHeight + radius * 0.08],
      [radius * 0.96, centerHeight + radius * 0.08],
      [radius * 0.9, centerHeight + radius * 0.55],
      [radius * 0.68, centerHeight + radius * 0.84],
      [radius * 0.28, centerHeight + radius * 1.02],
      [0, centerHeight + radius * 1.04],
    ],
    quality === 'high' ? 10 : 6,
    0.95,
  );
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
