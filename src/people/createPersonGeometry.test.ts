import { describe, expect, it } from 'vitest';

import {
  createPersonBodyGeometry,
  createPersonHairGeometry,
  createPersonHeadGeometry,
  type PersonPose,
} from './createPersonGeometry';

describe('createPersonGeometry', () => {
  it.each<PersonPose>(['seated', 'standing', 'athletic'])(
    'creates finite, rounded %s body geometry',
    (pose) => {
      const geometry = createPersonBodyGeometry(pose, 1.78);
      geometry.computeBoundingBox();
      const bounds = geometry.boundingBox;

      expect(bounds).not.toBeNull();
      expect(geometry.getAttribute('position').count).toBeGreaterThan(100);
      expect(bounds?.min.y).toBeGreaterThanOrEqual(0);
      expect(bounds?.max.y).toBeLessThan(1.78);
      geometry.dispose();
    },
  );

  it('creates a head above the torso at both quality levels', () => {
    const low = createPersonHeadGeometry('standing', 1.78, 'low');
    const high = createPersonHeadGeometry('standing', 1.78, 'high');

    expect(low.boundingBox?.max.y).toBeGreaterThan(1.7);
    expect(low.boundingBox?.min.y).toBeGreaterThan(0.75);
    expect(high.getAttribute('position').count).toBeGreaterThan(
      low.getAttribute('position').count,
    );
    low.dispose();
    high.dispose();
  });

  it('creates a separate fitted hair cap without primitive spheres', () => {
    const hair = createPersonHairGeometry('athletic', 1.78, 'high');

    expect(hair.boundingBox?.min.y).toBeGreaterThan(1.6);
    expect(hair.getAttribute('position').count).toBeGreaterThan(40);
    hair.dispose();
  });
});
