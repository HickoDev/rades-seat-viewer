import { describe, expect, it } from 'vitest';

import {
  angleAtArcLength,
  createEllipticalArcTable,
} from './ellipticalArcTable';

describe('ellipticalArcTable', () => {
  it('has strictly monotonic cumulative arc length', () => {
    const table = createEllipticalArcTable(102, 80, 512);

    for (let index = 1; index < table.cumulativeLengths.length; index += 1) {
      expect(table.cumulativeLengths[index]).toBeGreaterThan(
        table.cumulativeLengths[index - 1],
      );
    }
  });

  it('converts equal distances into valid increasing angles', () => {
    const table = createEllipticalArcTable(102, 80, 512);
    const angles = Array.from({ length: 12 }, (_, index) =>
      angleAtArcLength(table, (table.totalLength * index) / 12),
    );

    expect(angles.every((angle) => angle >= 0 && angle < Math.PI * 2)).toBe(
      true,
    );
    expect(angles.slice(1).every((angle, index) => angle > angles[index])).toBe(
      true,
    );
  });
});
