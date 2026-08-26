import { afterEach, describe, expect, it } from 'vitest';
import { Mesh } from 'three';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { createScoreboardPlacements } from '../stadium/roof/scoreboardPlacements';
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
        'sun-scoreboard-1',
        'sun-scoreboard--1',
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

  it('keeps scoreboard shadows aligned to the upper-virage displays', () => {
    occluders = createStadiumSunOccluders();
    const placement = createScoreboardPlacements(radesStadiumConfig).find(
      (candidate) => candidate.side === 1,
    );
    const scoreboard = occluders.find(
      (occluder) => occluder.name === 'sun-scoreboard-1',
    );

    expect(scoreboard?.position.toArray()).toEqual(placement?.position);
  });
});
