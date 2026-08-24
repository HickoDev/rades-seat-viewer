import { Matrix4, Quaternion, Vector3 } from 'three';

const cylinderAxis = new Vector3(0, 1, 0);

export function createCylinderBetweenMatrix(
  start: Vector3,
  end: Vector3,
  radius: number,
): Matrix4 {
  const midpoint = start.clone().add(end).multiplyScalar(0.5);
  const direction = end.clone().sub(start);
  const length = direction.length();
  const quaternion = new Quaternion().setFromUnitVectors(
    cylinderAxis,
    direction.normalize(),
  );

  return new Matrix4().compose(
    midpoint,
    quaternion,
    new Vector3(radius, length, radius),
  );
}
