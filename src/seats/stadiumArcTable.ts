import { getStadiumPerimeterPoint } from '../stadium/geometry/stadiumPerimeter';
import type { EllipticalArcTable } from './ellipticalArcTable';

export function createStadiumArcTable(
  extentX: number,
  extentZ: number,
  sampleCount = 1024,
): EllipticalArcTable {
  if (extentX < extentZ || extentZ <= 0 || sampleCount < 8) {
    throw new Error(
      'Stadium extents must satisfy extentX >= extentZ > 0 and sampleCount must be at least 8.',
    );
  }

  const angles = new Float32Array(sampleCount + 1);
  const cumulativeLengths = new Float64Array(sampleCount + 1);
  let previous = getStadiumPerimeterPoint(0, extentX, extentZ);
  let totalLength = 0;

  for (let index = 1; index <= sampleCount; index += 1) {
    const angle = (index / sampleCount) * Math.PI * 2;
    const point = getStadiumPerimeterPoint(angle, extentX, extentZ);
    totalLength += Math.hypot(point.x - previous.x, point.z - previous.z);
    angles[index] = angle;
    cumulativeLengths[index] = totalLength;
    previous = point;
  }

  return { angles, cumulativeLengths, totalLength };
}
