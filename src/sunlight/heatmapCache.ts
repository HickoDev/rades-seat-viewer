import type { SunHeatmapResult } from './sunlightHeatmap.types';

const cachePrefix = 'rades-view:heatmap:';

export function readHeatmapCache(cacheKey: string): SunHeatmapResult | null {
  try {
    const value = localStorage.getItem(`${cachePrefix}${cacheKey}`);
    if (!value) return null;
    const result = JSON.parse(value) as SunHeatmapResult;
    return result.cacheKey === cacheKey && Array.isArray(result.cells)
      ? result
      : null;
  } catch {
    return null;
  }
}

export function writeHeatmapCache(result: SunHeatmapResult) {
  try {
    localStorage.setItem(
      `${cachePrefix}${result.cacheKey}`,
      JSON.stringify(result),
    );
  } catch {
    // Storage may be disabled or full. The in-memory Zustand result still works.
  }
}
