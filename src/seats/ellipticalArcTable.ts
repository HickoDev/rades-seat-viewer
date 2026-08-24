export type EllipticalArcTable = {
  angles: Float32Array;
  cumulativeLengths: Float64Array;
  totalLength: number;
};

export function createEllipticalArcTable(
  radiusX: number,
  radiusZ: number,
  sampleCount = 1024,
): EllipticalArcTable {
  if (radiusX <= 0 || radiusZ <= 0 || sampleCount < 8) {
    throw new Error(
      'Ellipse radii must be positive and sampleCount must be at least 8.',
    );
  }

  const angles = new Float32Array(sampleCount + 1);
  const cumulativeLengths = new Float64Array(sampleCount + 1);
  let previousX = radiusX;
  let previousZ = 0;
  let totalLength = 0;

  for (let index = 1; index <= sampleCount; index += 1) {
    const angle = (index / sampleCount) * Math.PI * 2;
    const x = Math.cos(angle) * radiusX;
    const z = Math.sin(angle) * radiusZ;
    totalLength += Math.hypot(x - previousX, z - previousZ);
    angles[index] = angle;
    cumulativeLengths[index] = totalLength;
    previousX = x;
    previousZ = z;
  }

  return { angles, cumulativeLengths, totalLength };
}

function findUpperIndex(values: Float64Array, target: number): number {
  let lower = 0;
  let upper = values.length - 1;

  while (lower < upper) {
    const middle = Math.floor((lower + upper) / 2);
    if (values[middle] < target) {
      lower = middle + 1;
    } else {
      upper = middle;
    }
  }

  return lower;
}

export function angleAtArcLength(
  table: EllipticalArcTable,
  distance: number,
): number {
  const wrapped =
    ((distance % table.totalLength) + table.totalLength) % table.totalLength;
  const upperIndex = Math.max(
    1,
    findUpperIndex(table.cumulativeLengths, wrapped),
  );
  const lowerIndex = upperIndex - 1;
  const lowerDistance = table.cumulativeLengths[lowerIndex];
  const upperDistance = table.cumulativeLengths[upperIndex];
  const interval = upperDistance - lowerDistance;
  const ratio = interval === 0 ? 0 : (wrapped - lowerDistance) / interval;

  return (
    table.angles[lowerIndex] +
    (table.angles[upperIndex] - table.angles[lowerIndex]) * ratio
  );
}

export function arcLengthAtAngle(
  table: EllipticalArcTable,
  angle: number,
): number {
  const fullTurn = Math.PI * 2;
  const normalized = ((angle % fullTurn) + fullTurn) % fullTurn;
  const approximateIndex = (normalized / fullTurn) * (table.angles.length - 1);
  const lowerIndex = Math.floor(approximateIndex);
  const upperIndex = Math.min(lowerIndex + 1, table.angles.length - 1);
  const ratio = approximateIndex - lowerIndex;

  return (
    table.cumulativeLengths[lowerIndex] +
    (table.cumulativeLengths[upperIndex] -
      table.cumulativeLengths[lowerIndex]) *
      ratio
  );
}
