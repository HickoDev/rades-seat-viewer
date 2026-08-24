import { describe, expect, it } from 'vitest';

import { createGoalNetGeometry } from './createGoalNetGeometry';

describe('createGoalNetGeometry', () => {
  it('extends behind the goal line and preserves the configured opening', () => {
    const geometry = createGoalNetGeometry({
      side: 1,
      goalLineX: 52.56,
      width: 7.32,
      height: 2.44,
      groundDepth: 2,
      topDepth: 0.9,
      gridSpacing: 0.48,
    });

    expect(geometry.boundingBox?.min.x).toBeCloseTo(52.56, 4);
    expect(geometry.boundingBox?.max.x).toBeCloseTo(54.56, 4);
    expect(geometry.boundingBox?.min.z).toBeCloseTo(-3.66, 4);
    expect(geometry.boundingBox?.max.z).toBeCloseTo(3.66, 4);
    expect(geometry.boundingBox?.max.y).toBeCloseTo(2.44, 4);
  });

  it('mirrors the net behind the opposite goal', () => {
    const geometry = createGoalNetGeometry({
      side: -1,
      goalLineX: 52.56,
      width: 7.32,
      height: 2.44,
      groundDepth: 2,
      topDepth: 0.9,
      gridSpacing: 0.48,
    });

    expect(geometry.boundingBox?.min.x).toBeCloseTo(-54.56, 4);
    expect(geometry.boundingBox?.max.x).toBeCloseTo(-52.56, 4);
  });
});
