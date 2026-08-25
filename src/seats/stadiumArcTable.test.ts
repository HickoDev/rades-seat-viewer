import { describe, expect, it } from 'vitest';

import { angleAtArcLength } from './ellipticalArcTable';
import { createStadiumArcTable } from './stadiumArcTable';

describe('stadiumArcTable', () => {
  it('is monotonic and keeps quarter points equally spaced', () => {
    const table = createStadiumArcTable(96, 60, 1024);
    expect(
      Array.from(table.cumulativeLengths).every(
        (distance, index, values) =>
          index === 0 || distance >= values[index - 1],
      ),
    ).toBe(true);
    expect(angleAtArcLength(table, table.totalLength / 4)).toBeCloseTo(
      Math.PI / 2,
      3,
    );
  });
});
