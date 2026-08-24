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
