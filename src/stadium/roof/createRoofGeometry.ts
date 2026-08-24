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
  waveCount?: number;
  outerWaveHeight?: number;
  outerWaveRadius?: number;
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
  waveCount = 0,
  outerWaveHeight = 0,
  outerWaveRadius = 0,
}: RoofGeometryOptions): BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];

  for (let index = 0; index <= segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const outerWave = waveCount > 0 ? Math.cos(angle * waveCount) : 0;
    const wavedOuterRadiusX = outerRadiusX + outerWave * outerWaveRadius;
    const wavedOuterRadiusZ = outerRadiusZ + outerWave * outerWaveRadius;
    const wavedOuterHeight = outerHeight + outerWave * outerWaveHeight;
    positions.push(
      cos * innerRadiusX,
      innerHeight,
      sin * innerRadiusZ,
      cos * wavedOuterRadiusX,
      wavedOuterHeight,
      sin * wavedOuterRadiusZ,
      cos * innerRadiusX,
      innerHeight - thickness,
      sin * innerRadiusZ,
      cos * wavedOuterRadiusX,
      wavedOuterHeight - thickness,
      sin * wavedOuterRadiusZ,
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
