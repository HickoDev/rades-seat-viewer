import type {
  HeatmapClassification,
  HeatmapResolution,
  HeatmapTimeMode,
  SunHeatmapCell,
} from './sunlightHeatmap.types';

export function getHeatmapGroupKey(
  sectionId: string,
  rowNumber: number,
  resolution: HeatmapResolution,
) {
  return resolution === 'row' ? `${sectionId}:row-${rowNumber}` : sectionId;
}

export function classifyHeatmapExposure(
  directSunMinutes: number,
  shadedMinutes: number,
): HeatmapClassification {
  const total = directSunMinutes + shadedMinutes;
  if (total <= 0 || directSunMinutes <= 0) return 'fully-shaded';
  const exposedFraction = directSunMinutes / total;
  if (exposedFraction > 0.75) return 'mostly-sunny';
  if (exposedFraction > 0.25) return 'partially-sunny';
  return 'mostly-shaded';
}

export function createHeatmapCacheKey(
  configVersion: string,
  matchStartIso: string,
  matchEndIso: string,
  resolution: HeatmapResolution,
  timeMode: HeatmapTimeMode = 'match',
  previewIso: string | null = null,
) {
  return [
    'rades-sun-heatmap',
    'physics-3',
    configVersion,
    resolution,
    timeMode,
    timeMode === 'instant' ? previewIso : `${matchStartIso}/${matchEndIso}`,
  ].join(':');
}

export function countHeatmapClasses(cells: SunHeatmapCell[]) {
  const counts: Record<HeatmapClassification, number> = {
    'mostly-sunny': 0,
    'partially-sunny': 0,
    'mostly-shaded': 0,
    'fully-shaded': 0,
  };
  cells.forEach((cell) => {
    counts[cell.classification] += 1;
  });
  return counts;
}
