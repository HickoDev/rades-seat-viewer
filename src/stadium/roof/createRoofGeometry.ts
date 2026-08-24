import { BufferGeometry, Float32BufferAttribute } from 'three';

export type RoofGeometryOptions = {
  innerRadiusX: number;
  innerRadiusZ: number;
  outerRadiusX: number;
  outerRadiusZ: number;
  innerHeight: number;
  outerHeight: number;
  thickness: number;
  segments?: number;
};

export function createRoofGeometry({
  innerHeight,
  innerRadiusX,
  innerRadiusZ,
  outerHeight,
  outerRadiusX,
  outerRadiusZ,
  segments = 256,
  thickness,
}: RoofGeometryOptions): BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];

  for (let index = 0; index <= segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    positions.push(
      cos * innerRadiusX,
      innerHeight,
      sin * innerRadiusZ,
      cos * outerRadiusX,
      outerHeight,
      sin * outerRadiusZ,
      cos * innerRadiusX,
      innerHeight - thickness,
      sin * innerRadiusZ,
      cos * outerRadiusX,
      outerHeight - thickness,
      sin * outerRadiusZ,
    );

    if (index < segments) {
      const base = index * 4;
      const next = base + 4;
      indices.push(
        base,
        next,
        base + 1,
        base + 1,
        next,
        next + 1,
        base + 2,
        base + 3,
        next + 2,
        base + 3,
        next + 3,
        next + 2,
        base,
        base + 2,
        next,
        base + 2,
        next + 2,
        next,
        base + 1,
        next + 1,
        base + 3,
        base + 3,
        next + 1,
        next + 3,
      );
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
