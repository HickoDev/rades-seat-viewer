import { Vector2 } from 'three';

const fullTurn = Math.PI * 2;

export type StadiumPerimeterPoint = {
  x: number;
  z: number;
};

export type StadiumPerimeterFrame = StadiumPerimeterPoint & {
  tangentX: number;
  tangentZ: number;
};

function assertExtents(extentX: number, extentZ: number) {
  if (extentZ <= 0 || extentX < extentZ) {
    throw new Error(
      'A rounded-stadium perimeter requires extentX >= extentZ > 0.',
    );
  }
}

export function getStadiumPerimeterLength(
  extentX: number,
  extentZ: number,
): number {
  assertExtents(extentX, extentZ);
  const halfStraight = extentX - extentZ;
  return Math.PI * 2 * extentZ + halfStraight * 4;
}

/**
 * Returns a point on the Radès rounded-rectangle plan. `angle` remains a
 * convenient full-turn coordinate: 0 is the east goal end, PI / 2 is the
 * centre of the north long side. Equal angle increments are equal distances
 * around the capsule, which keeps section widths and seat spacing stable.
 */
export function getStadiumPerimeterPoint(
  angle: number,
  extentX: number,
  extentZ: number,
): StadiumPerimeterPoint {
  assertExtents(extentX, extentZ);
  const normalized = ((angle % fullTurn) + fullTurn) % fullTurn;
  const radius = extentZ;
  const halfStraight = extentX - extentZ;
  const quarterArcLength = (Math.PI * radius) / 2;
  const straightLength = halfStraight * 2;
  let distance =
    (normalized / fullTurn) * getStadiumPerimeterLength(extentX, extentZ);

  if (distance <= quarterArcLength) {
    const curveAngle = distance / radius;
    return {
      x: halfStraight + Math.cos(curveAngle) * radius,
      z: Math.sin(curveAngle) * radius,
    };
  }

  distance -= quarterArcLength;
  if (distance <= straightLength) {
    return { x: halfStraight - distance, z: radius };
  }

  distance -= straightLength;
  if (distance <= Math.PI * radius) {
    const curveAngle = Math.PI / 2 + distance / radius;
    return {
      x: -halfStraight + Math.cos(curveAngle) * radius,
      z: Math.sin(curveAngle) * radius,
    };
  }

  distance -= Math.PI * radius;
  if (distance <= straightLength) {
    return { x: -halfStraight + distance, z: -radius };
  }

  distance -= straightLength;
  const curveAngle = -Math.PI / 2 + distance / radius;
  return {
    x: halfStraight + Math.cos(curveAngle) * radius,
    z: Math.sin(curveAngle) * radius,
  };
}

export function getStadiumPerimeterFrame(
  angle: number,
  extentX: number,
  extentZ: number,
): StadiumPerimeterFrame {
  const point = getStadiumPerimeterPoint(angle, extentX, extentZ);
  const epsilon = 0.0001;
  const before = getStadiumPerimeterPoint(angle - epsilon, extentX, extentZ);
  const after = getStadiumPerimeterPoint(angle + epsilon, extentX, extentZ);
  const tangent = new Vector2(
    after.x - before.x,
    after.z - before.z,
  ).normalize();

  return {
    ...point,
    tangentX: tangent.x,
    tangentZ: tangent.y,
  };
}

export function getStadiumPerimeterAngleForDistance(
  distance: number,
  extentX: number,
  extentZ: number,
): number {
  return (distance / getStadiumPerimeterLength(extentX, extentZ)) * fullTurn;
}
