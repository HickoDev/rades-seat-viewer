import type { HeatmapClassification } from './sunlightHeatmap.types';

export const heatmapColorValues: Record<HeatmapClassification, string> = {
  'mostly-sunny': '#f59e0b',
  'partially-sunny': '#facc15',
  'mostly-shaded': '#0f8a78',
  'fully-shaded': '#31546f',
};
