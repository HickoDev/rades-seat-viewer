export type HeatmapResolution = 'section' | 'row';
export type HeatmapTimeMode = 'instant' | 'match';

export type HeatmapClassification =
  'mostly-sunny' | 'partially-sunny' | 'mostly-shaded' | 'fully-shaded';

export type SunHeatmapCell = {
  key: string;
  sectionId: string;
  tierId: string;
  rowNumber: number | null;
  representativeSeatId: string;
  classification: HeatmapClassification;
  directSunMinutes: number;
  shadedMinutes: number;
  exposedPercent: number;
};

export type SunHeatmapResult = {
  cacheKey: string;
  resolution: HeatmapResolution;
  timeMode: HeatmapTimeMode;
  previewIso: string | null;
  generatedAtIso: string;
  cells: SunHeatmapCell[];
};

export type SunHeatmapWorkerRequest = {
  type: 'simulate';
  cacheKey: string;
  matchStartIso: string;
  matchEndIso: string;
  resolution: HeatmapResolution;
  timeMode: HeatmapTimeMode;
  previewIso: string | null;
};

export type SunHeatmapWorkerResponse =
  | { type: 'result'; result: SunHeatmapResult }
  | { type: 'error'; cacheKey: string; message: string };
