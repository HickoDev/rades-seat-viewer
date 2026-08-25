import { describe, expect, it } from 'vitest';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { getInteriorSectionZone } from './sectionZones';

describe('getInteriorSectionZone', () => {
  const lowerTier = radesStadiumConfig.tiers[0];
  const upperTier = radesStadiumConfig.tiers[1];
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

  it('identifies the official, enceinte, and opposite pelouse areas', () => {
    expect(getInteriorSectionZone(lowerTier, 7, grandstand).id).toBe(
      'honor-press',
    );
    expect(getInteriorSectionZone(lowerTier, 4, grandstand)).toMatchObject({
      id: 'enceinte',
      label: 'Enceinte inférieure',
    });
    expect(getInteriorSectionZone(upperTier, 11, grandstand)).toMatchObject({
      id: 'enceinte',
      label: 'Enceinte supérieure',
    });
    expect(getInteriorSectionZone(lowerTier, 23, grandstand).id).toBe(
      'pelouse',
    );
    expect(getInteriorSectionZone(lowerTier, 20, grandstand).label).toBe(
      'Pelouse',
    );
    expect(getInteriorSectionZone(upperTier, 27, grandstand).label).toBe(
      'Pelouse',
    );
  });

  it('marks the upper virages as closed rather than public terraces', () => {
    expect(getInteriorSectionZone(upperTier, 0, grandstand)).toMatchObject({
      id: 'closed-upper-virage',
      viewingArea: 'closed',
    });
    expect(
      getInteriorSectionZone(upperTier, 7, grandstand).viewingArea,
    ).not.toBe('closed');
  });
});
