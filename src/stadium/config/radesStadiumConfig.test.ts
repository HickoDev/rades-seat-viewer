import { describe, expect, it } from 'vitest';

import { radesStadiumConfig } from './radesStadiumConfig';

describe('radesStadiumConfig', () => {
  it('keeps the verified foundation measurements explicit', () => {
    expect(radesStadiumConfig.pitch).toMatchObject({ length: 105, width: 68 });
    expect(radesStadiumConfig.structure.frameCount).toBe(64);
    expect(radesStadiumConfig.identity.timezone).toBe('Africa/Tunis');

    expect(radesStadiumConfig.verification.values['pitch.length']).toBe(
      'verified-from-project-brief',
    );
    expect(radesStadiumConfig.verification.values.roof).toBe(
      'estimate-requires-calibration',
    );
  });

  it('records the contractor-sourced structural facts', () => {
    expect(radesStadiumConfig.identity.statedCapacity).toBe(60_000);
    expect(radesStadiumConfig.structure).toMatchObject({
      frameCount: 64,
      portalFrameHeight: 33,
      coveredEnclosureAreaSquareMetres: 13_000,
    });
    expect(
      radesStadiumConfig.verification.values['structure.portalFrameHeight'],
    ).toBe('verified-from-contractor');
  });

  it('keeps the estimated lower bowl outside the full track envelope', () => {
    const { track, tiers } = radesStadiumConfig;
    const outerTrackRadius =
      track.innerCurveRadius + track.laneCount * track.laneWidth;
    const trackEndX = track.straightLength / 2 + outerTrackRadius;
    const lowerTier = tiers[0];

    expect(lowerTier.startRadiusX).toBeGreaterThan(trackEndX);
    expect(lowerTier.startRadiusZ).toBeGreaterThan(outerTrackRadius);
  });
});
