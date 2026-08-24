export type VerificationStatus =
  'verified-from-project-brief' | 'estimate-requires-calibration';

export type StadiumConfig = {
  version: string;
  identity: {
    name: string;
    timezone: string;
    latitude: number;
    longitude: number;
    northRotationDegrees: number;
  };
  pitch: {
    length: number;
    width: number;
    lineWidth: number;
    centerCircleRadius: number;
    penaltyAreaLength: number;
    penaltyAreaWidth: number;
    goalAreaLength: number;
    goalAreaWidth: number;
    penaltySpotDistance: number;
    cornerArcRadius: number;
    goalWidth: number;
    goalHeight: number;
    goalDepth: number;
    mowingStripeCount: number;
  };
  track: {
    laneCount: number;
    laneWidth: number;
    straightLength: number;
    innerCurveRadius: number;
  };
  tiers: Array<{
    id: string;
    name: string;
    sectionCount: number;
    rowCount: number;
    startRadiusX: number;
    startRadiusZ: number;
    baseHeight: number;
    rowDepth: number;
    rowHeight: number;
    aisleWidth: number;
    walkwayWidth: number;
    vomitoryEverySections: number;
    vomitoryRow: number;
    vomitoryWidth: number;
    vomitoryHeight: number;
  }>;
  roof: {
    innerRadiusX: number;
    innerRadiusZ: number;
    outerRadiusX: number;
    outerRadiusZ: number;
    innerHeight: number;
    outerHeight: number;
  };
  structure: {
    frameCount: number;
  };
  verification: {
    values: Record<string, VerificationStatus>;
    notes: string[];
  };
};
