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
  innerWaveHeight?: number;
  membraneSag?: number;
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
  innerWaveHeight = 0,
  membraneSag = 0,
}: RoofGeometryOptions): BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  const middleRatio = 0.56;

  for (let index = 0; index <= segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const outerWave = waveCount > 0 ? Math.cos(angle * waveCount) : 0;
    const wavedOuterRadiusX = outerRadiusX + outerWave * outerWaveRadius;
    const wavedOuterRadiusZ = outerRadiusZ + outerWave * outerWaveRadius;
    const wavedOuterHeight = outerHeight + outerWave * outerWaveHeight;
    const wavedInnerHeight = innerHeight + outerWave * innerWaveHeight;
    const middleRadiusX =
      innerRadiusX + (wavedOuterRadiusX - innerRadiusX) * middleRatio;
    const middleRadiusZ =
      innerRadiusZ + (wavedOuterRadiusZ - innerRadiusZ) * middleRatio;
    const middleBaseHeight =
      wavedInnerHeight + (wavedOuterHeight - wavedInnerHeight) * middleRatio;
    const baySag = membraneSag * (0.68 + ((1 - outerWave) / 2) * 0.32);
    const middleHeight = middleBaseHeight - baySag;
    positions.push(
      cos * innerRadiusX,
      wavedInnerHeight,
      sin * innerRadiusZ,
      cos * middleRadiusX,
      middleHeight,
      sin * middleRadiusZ,
      cos * wavedOuterRadiusX,
      wavedOuterHeight,
      sin * wavedOuterRadiusZ,
      cos * innerRadiusX,
      wavedInnerHeight - thickness,
      sin * innerRadiusZ,
      cos * middleRadiusX,
      middleHeight - thickness,
      sin * middleRadiusZ,
      cos * wavedOuterRadiusX,
      wavedOuterHeight - thickness,
      sin * wavedOuterRadiusZ,
    );

    if (index < segments) {
      const base = index * 6;
      const next = base + 6;
      indices.push(
        base,
        next,
        base + 1,
        base + 1,
        next,
        next + 1,
        base + 1,
        next + 1,
        base + 2,
        base + 2,
        next + 1,
        next + 2,
        base + 3,
        base + 4,
        next + 3,
        base + 4,
        next + 4,
        next + 3,
        base + 4,
        base + 5,
        next + 4,
        base + 5,
        next + 5,
        next + 4,
        base,
        base + 3,
        next,
        base + 3,
        next + 3,
        next,
        base + 2,
        next + 2,
        base + 5,
        base + 5,
        next + 2,
        next + 5,
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
