import { describe, expect, it } from 'vitest';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { getInteriorSectionZone } from './sectionZones';

describe('getInteriorSectionZone', () => {
  const lowerTier = radesStadiumConfig.tiers[0];
  const grandstand = radesStadiumConfig.grandstand;

  it('distinguishes the two chairless virages from seated sections', () => {
    expect(getInteriorSectionZone(lowerTier, 0, grandstand).id).toBe(
      'virage-one',
    );
    expect(getInteriorSectionZone(lowerTier, 16, grandstand).id).toBe(
      'virage-two',
    );
    expect(getInteriorSectionZone(lowerTier, 0, grandstand).viewingArea).toBe(
      'terrace',
    );
  });

  it('identifies the honor and opposite stands independently', () => {
    expect(getInteriorSectionZone(lowerTier, 7, grandstand).id).toBe(
      'honor-press',
    );
    expect(getInteriorSectionZone(lowerTier, 23, grandstand).id).toBe(
      'opposite-stand',
    );
  });
});
