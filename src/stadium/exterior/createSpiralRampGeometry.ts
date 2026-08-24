import { BufferGeometry, Float32BufferAttribute } from 'three';

export type SpiralRampGeometryOptions = {
  outerRadius: number;
  width: number;
  height: number;
  turns: number;
  thickness?: number;
  segmentsPerTurn?: number;
};

export function createSpiralRampGeometry({
  height,
  outerRadius,
  segmentsPerTurn = 48,
  thickness = 0.34,
  turns,
  width,
}: SpiralRampGeometryOptions): BufferGeometry {
  const innerRadius = outerRadius - width;
  const segmentCount = Math.ceil(turns * segmentsPerTurn);
  const positions: number[] = [];
  const indices: number[] = [];

  for (let index = 0; index <= segmentCount; index += 1) {
    const progress = index / segmentCount;
    const angle = progress * turns * Math.PI * 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const y = progress * height;
    positions.push(
      cos * innerRadius,
      y,
      sin * innerRadius,
      cos * outerRadius,
      y,
      sin * outerRadius,
      cos * innerRadius,
      y - thickness,
      sin * innerRadius,
      cos * outerRadius,
      y - thickness,
      sin * outerRadius,
    );

    if (index < segmentCount) {
      const base = index * 4;
      const next = base + 4;
      indices.push(
        base,
        base + 1,
        next,
        base + 1,
        next + 1,
        next,
        base + 2,
        next + 2,
        base + 3,
        base + 3,
        next + 2,
        next + 3,
        base,
        next,
        base + 2,
        base + 2,
        next,
        next + 2,
        base + 1,
        base + 3,
        next + 1,
        base + 3,
        next + 3,
        next + 1,
      );
    }
  }

  indices.push(0, 2, 1, 1, 2, 3);
  const end = segmentCount * 4;
  indices.push(end, end + 1, end + 2, end + 1, end + 3, end + 2);

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

export function createSpiralGuardGeometry({
  guardHeight = 1,
  height,
  outerRadius,
  segmentsPerTurn = 48,
  turns,
}: Omit<SpiralRampGeometryOptions, 'width' | 'thickness'> & {
  guardHeight?: number;
}): BufferGeometry {
  const segmentCount = Math.ceil(turns * segmentsPerTurn);
  const positions: number[] = [];
  const indices: number[] = [];
  for (let index = 0; index <= segmentCount; index += 1) {
    const progress = index / segmentCount;
    const angle = progress * turns * Math.PI * 2;
    const y = progress * height;
    const x = Math.cos(angle) * outerRadius;
    const z = Math.sin(angle) * outerRadius;
    positions.push(x, y, z, x, y + guardHeight, z);
    if (index < segmentCount) {
      const base = index * 2;
      indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
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
