import { describe, expect, it } from 'vitest';

import { findSeat } from './seatMetadata';
import {
  findRepresentativeTerracePosition,
  findViewingPosition,
  isTerraceSection,
} from './viewingPositions';

describe('stadium viewing positions', () => {
  it('uses the terrace grid for a virage without creating a chair seat', () => {
    const representative = findRepresentativeTerracePosition('lower-01');

    expect(representative).not.toBeNull();
    expect(representative?.sectionId).toBe('lower-01');
    expect(
      findSeat(
        representative?.sectionId ?? null,
        representative?.rowNumber ?? null,
        representative?.seatNumber ?? null,
      ),
    ).toBeNull();
    expect(
      findViewingPosition(
        representative?.sectionId ?? null,
        representative?.rowNumber ?? null,
        representative?.seatNumber ?? null,
        'terrace',
      ),
    ).toEqual({ kind: 'terrace', metadata: representative });
  });

  it('distinguishes virage terraces from seated sections', () => {
    expect(isTerraceSection('lower-01')).toBe(true);
    expect(isTerraceSection('upper-32')).toBe(true);
    expect(isTerraceSection('lower-05')).toBe(false);
    expect(findRepresentativeTerracePosition('lower-05')).toBeNull();
  });
});
