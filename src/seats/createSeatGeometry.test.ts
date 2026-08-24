import { describe, expect, it } from 'vitest';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { createSeatGeometry } from './createSeatGeometry';

describe('createSeatGeometry', () => {
  it('creates a finite rounded chair profile without individual React meshes', () => {
    const geometry = createSeatGeometry(radesStadiumConfig.seats, 'high');
    geometry.computeBoundingBox();

    expect(geometry.boundingBox?.max.y).toBeGreaterThan(
      radesStadiumConfig.seats.panHeight,
    );
    expect(geometry.boundingBox?.max.x).toBeLessThanOrEqual(
      radesStadiumConfig.seats.width / 2 + 0.01,
    );
    expect(
      Array.from(geometry.getAttribute('position').array).every(
        Number.isFinite,
      ),
    ).toBe(true);
    geometry.dispose();
  });

  it('keeps the low-quality shared seat simpler than the high-quality one', () => {
    const low = createSeatGeometry(radesStadiumConfig.seats, 'low');
    const high = createSeatGeometry(radesStadiumConfig.seats, 'high');

    expect(high.getAttribute('position').count).toBeGreaterThan(
      low.getAttribute('position').count,
    );
    low.dispose();
    high.dispose();
  });
});
