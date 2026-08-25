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
    expect(radesStadiumConfig.identity.historicalReportedCapacity).toBe(60_000);
    expect(radesStadiumConfig.identity.currentUsableCapacity).toBeNull();
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

  it('configures the two athletics bends independently', () => {
    const [west, east] = radesStadiumConfig.track.eventEnds;

    expect(west.side).toBe(-1);
    expect(east.side).toBe(1);
    expect(west.apronStartOffset).not.toBe(east.apronStartOffset);
    expect(west.runwayWidth).not.toBe(east.runwayWidth);
    expect(west.throwingCircleOffsetZ).not.toBe(east.throwingCircleOffsetZ);
  });

  it('matches the reference oval and adds the straight-side jump facility', () => {
    const { straightJump } = radesStadiumConfig.track;

    expect(radesStadiumConfig.track.laneCount).toBe(8);
    expect(straightJump.runwayLength).toBeGreaterThan(35);
    expect(straightJump.pitLength).toBeGreaterThan(8);
  });

  it('groups inner-roof floodlights into maintainable banks', () => {
    const { roof } = radesStadiumConfig;

    expect(roof.floodlightBankCount * roof.floodlightsPerBank).toBe(
      roof.floodlightCount,
    );
    expect(roof.innerCatwalkHeight).toBeLessThan(roof.innerHeight);
    expect(roof.innerCatwalkRailHeight).toBeGreaterThan(0.9);
  });

  it('records the reported honor and press tribune capacities separately', () => {
    expect(
      radesStadiumConfig.tiers.map((tier) => tier.historicalReportedCapacity),
    ).toEqual([32_000, 28_000]);
    expect(radesStadiumConfig.grandstand).toMatchObject({
      officialCapacity: 7_000,
      pressDeskCount: 300,
    });
    expect(
      radesStadiumConfig.verification.values['grandstand.officialCapacity'],
    ).toBe('corroborated-secondary-source');
    expect(
      radesStadiumConfig.verification.values['grandstand.dimensions'],
    ).toBe('estimate-requires-calibration');
    expect(radesStadiumConfig.grandstand.vipSectionIndices).toEqual([7, 8]);
  });

  it('records the four photographed circular ramp towers as estimates', () => {
    expect(radesStadiumConfig.structure.rampCount).toBe(4);
    expect(radesStadiumConfig.structure.rampTowerRadius).toBeGreaterThan(8);
    expect(radesStadiumConfig.structure.rampTowerCenterXs).toEqual([
      -116, -86, 86, 116,
    ]);
    expect(
      radesStadiumConfig.verification.values['structure.spiralRamps'],
    ).toBe('estimate-requires-calibration');
  });

  it('keeps the reported player route and technical areas unobstructed', () => {
    expect(radesStadiumConfig.grandstand.playerTunnelLength).toBe(30);
    expect(radesStadiumConfig.structure.benchSeparation).toBeGreaterThan(
      radesStadiumConfig.grandstand.playerTunnelWidth,
    );
    expect(
      radesStadiumConfig.verification.values['structure.playerTunnelLength'],
    ).toBe('corroborated-secondary-source');
  });
});
