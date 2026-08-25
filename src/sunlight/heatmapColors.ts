import type { HeatmapClassification } from './sunlightHeatmap.types';

export const heatmapColorValues: Record<HeatmapClassification, string> = {
  'mostly-sunny': '#ffad0a',
  'partially-sunny': '#f2cf54',
  'mostly-shaded': '#176b68',
  'fully-shaded': '#183744',
};
