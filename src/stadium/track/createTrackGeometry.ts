import { BufferGeometry, Float32BufferAttribute } from 'three';

export type TrackGeometryOptions = {
  innerRadius: number;
  laneWidth: number;
  laneCount: number;
  straightLength: number;
  segments?: number;
};

export type CapsulePoint = {
  x: number;
  z: number;
};

function getCapsulePointAtPhase(
  ratio: number,
  radius: number,
  straightLength: number,
): CapsulePoint {
  const phase = Math.min(Math.max(ratio, 0), 1) * 4;
  const halfStraight = straightLength / 2;

  if (phase <= 1) {
    const angle = -Math.PI / 2 + phase * Math.PI;
    return {
      x: halfStraight + Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
    };
  }

  if (phase <= 2) {
    return {
      x: halfStraight - (phase - 1) * straightLength,
      z: radius,
    };
  }

  if (phase <= 3) {
    const angle = Math.PI / 2 + (phase - 2) * Math.PI;
    return {
      x: -halfStraight + Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
    };
  }

  return {
    x: -halfStraight + (phase - 3) * straightLength,
    z: -radius,
  };
}

export function getCapsulePoint(
  distance: number,
  radius: number,
  straightLength: number,
): CapsulePoint {
  const curveLength = Math.PI * radius;
  const perimeter = 2 * straightLength + 2 * curveLength;
  let wrappedDistance = ((distance % perimeter) + perimeter) % perimeter;

  if (wrappedDistance <= curveLength) {
    const angle = -Math.PI / 2 + wrappedDistance / radius;
    return {
      x: straightLength / 2 + Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
    };
  }

  wrappedDistance -= curveLength;
  if (wrappedDistance <= straightLength) {
    return {
      x: straightLength / 2 - wrappedDistance,
      z: radius,
    };
  }

  wrappedDistance -= straightLength;
  if (wrappedDistance <= curveLength) {
    const angle = Math.PI / 2 + wrappedDistance / radius;
    return {
      x: -straightLength / 2 + Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
    };
  }

  wrappedDistance -= curveLength;
  return {
    x: -straightLength / 2 + wrappedDistance,
    z: -radius,
  };
}

export function createTrackGeometry({
  innerRadius,
  laneCount,
  laneWidth,
  segments = 256,
  straightLength,
}: TrackGeometryOptions): BufferGeometry {
  const outerRadius = innerRadius + laneCount * laneWidth;
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let index = 0; index <= segments; index += 1) {
    const ratio = index / segments;
    const inner = getCapsulePointAtPhase(ratio, innerRadius, straightLength);
    const outer = getCapsulePointAtPhase(ratio, outerRadius, straightLength);

    positions.push(inner.x, 0, inner.z, outer.x, 0, outer.z);
    normals.push(0, 1, 0, 0, 1, 0);
    uvs.push(ratio, 0, ratio, 1);

    if (index < segments) {
      const base = index * 2;
      indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();

  return geometry;
}
