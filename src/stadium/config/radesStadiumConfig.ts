import type { StadiumConfig } from '../types/stadium.types';

/**
 * All distances are metres and all angles are degrees.
 *
 * Milestone 1 deliberately records unverified values as calibration estimates.
 * They provide a coherent coordinate envelope for the scene but must not be
 * presented as surveyed architectural measurements.
 */
export const radesStadiumConfig = {
  version: 'foundation-1',
  identity: {
    name: 'Stade Olympique Hammadi-Agrebi',
    timezone: 'Africa/Tunis',
    latitude: 36.7478,
    longitude: 10.2728,
    northRotationDegrees: 0,
  },
  pitch: {
    length: 105,
    width: 68,
    lineWidth: 0.12,
    centerCircleRadius: 9.15,
    penaltyAreaLength: 16.5,
    penaltyAreaWidth: 40.32,
    goalAreaLength: 5.5,
    goalAreaWidth: 18.32,
    penaltySpotDistance: 11,
    cornerArcRadius: 1,
    goalWidth: 7.32,
    goalHeight: 2.44,
    goalDepth: 2,
    mowingStripeCount: 12,
  },
  track: {
    laneCount: 8,
    laneWidth: 1.22,
    straightLength: 84.39,
    innerCurveRadius: 36.5,
  },
  tiers: [
    {
      id: 'lower',
      name: 'Lower tier',
      sectionCount: 32,
      rowCount: 28,
      startRadiusX: 78,
      startRadiusZ: 60,
      baseHeight: 2,
      rowDepth: 0.82,
      rowHeight: 0.42,
      aisleWidth: 1.4,
    },
    {
      id: 'upper',
      name: 'Upper tier',
      sectionCount: 32,
      rowCount: 25,
      startRadiusX: 102,
      startRadiusZ: 80,
      baseHeight: 18.5,
      rowDepth: 0.86,
      rowHeight: 0.46,
      aisleWidth: 1.5,
    },
  ],
  roof: {
    innerRadiusX: 86,
    innerRadiusZ: 65,
    outerRadiusX: 128,
    outerRadiusZ: 102,
    innerHeight: 34,
    outerHeight: 42,
  },
  structure: {
    frameCount: 64,
  },
  verification: {
    values: {
      'identity.latitude': 'estimate-requires-calibration',
      'identity.longitude': 'estimate-requires-calibration',
      'identity.northRotationDegrees': 'estimate-requires-calibration',
      'pitch.length': 'verified-from-project-brief',
      'pitch.width': 'verified-from-project-brief',
      'pitch.markings': 'estimate-requires-calibration',
      track: 'estimate-requires-calibration',
      tiers: 'estimate-requires-calibration',
      roof: 'estimate-requires-calibration',
      'structure.frameCount': 'verified-from-project-brief',
    },
    notes: [
      'Coordinates are approximate and require verification against an authoritative survey.',
      'Scene north rotation is a neutral placeholder pending geographic calibration.',
      'Track, bowl, and roof dimensions are configurable design estimates for later milestones.',
    ],
  },
} satisfies StadiumConfig;
