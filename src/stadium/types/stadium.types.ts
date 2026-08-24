export type VerificationStatus =
  | 'verified-from-project-brief'
  | 'verified-from-contractor'
  | 'confirmed-by-project-owner'
  | 'calibrated-from-open-geodata'
  | 'corroborated-secondary-source'
  | 'estimate-requires-calibration';

export type StadiumConfig = {
  version: string;
  identity: {
    name: string;
    timezone: string;
    latitude: number;
    longitude: number;
    northRotationDegrees: number;
    statedCapacity: number;
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
    vomitoryDepth: number;
    vomitoryFrameThickness: number;
    seatlessSectionIndices: number[];
  }>;
  bowlDetails: {
    sectionBarrierHeight: number;
    sectionBarrierMidRailRatio: number;
    sectionBarrierRailRadius: number;
    sectionBarrierPostEveryRows: number;
    concourseWallInset: number;
    concoursePortalWidth: number;
    concoursePortalHeight: number;
    concoursePortalArchRise: number;
    concoursePortalDepth: number;
    concourseSignWidth: number;
    concourseSignHeight: number;
  };
  roof: {
    innerRadiusX: number;
    innerRadiusZ: number;
    outerRadiusX: number;
    outerRadiusZ: number;
    innerHeight: number;
    outerHeight: number;
    panelThickness: number;
    trussRadius: number;
  };
  structure: {
    frameCount: number;
    portalFrameHeight: number;
    coveredEnclosureAreaSquareMetres: number;
    exteriorRadiusOffset: number;
    columnRadius: number;
    facadeHeight: number;
    rampCount: number;
    rampWidth: number;
    rampRun: number;
    lightingMastCount: number;
    lightingMastHeight: number;
    scoreboardWidth: number;
    scoreboardHeight: number;
    scoreboardDepth: number;
    benchLength: number;
    benchDepth: number;
    benchHeight: number;
  };
  seats: {
    spacing: number;
    width: number;
    depth: number;
    panHeight: number;
    backHeight: number;
    eyeHeight: number;
    arcTableSamples: number;
  };
  occupants: {
    playerCount: number;
    standingPlayerHeight: number;
    seatedPersonHeight: number;
    highQualityCrowdOccupancy: number;
    lowQualityCrowdOccupancy: number;
  };
  verification: {
    values: Record<string, VerificationStatus>;
    notes: string[];
  };
};
