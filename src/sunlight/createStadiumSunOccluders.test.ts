import { afterEach, describe, expect, it } from 'vitest';
import { Mesh } from 'three';

import {
  createStadiumSunOccluders,
  disposeStadiumSunOccluders,
} from './createStadiumSunOccluders';

describe('shared stadium sun occluders', () => {
  let occluders: ReturnType<typeof createStadiumSunOccluders> = [];

  afterEach(() => {
    disposeStadiumSunOccluders(occluders);
    occluders = [];
  });

  it('includes the calibrated major stadium shadow structures with BVHs', () => {
    occluders = createStadiumSunOccluders();
    const names = new Set(occluders.map((occluder) => occluder.name));

    expect([...names]).toEqual(
      expect.arrayContaining([
        'sun-roof-membrane',
        'sun-roof-trusses',
        'sun-lower-structural-wall',
        'sun-upper-tier-slab',
        'sun-main-stand-facade',
        'sun-structural-frames',
        'sun-exterior-columns',
      ]),
    );
    expect(occluders.every((occluder) => occluder instanceof Mesh)).toBe(true);
    expect(
      occluders.every(
        (occluder) =>
          occluder instanceof Mesh && Boolean(occluder.geometry.boundsTree),
      ),
    ).toBe(true);
  });
});
