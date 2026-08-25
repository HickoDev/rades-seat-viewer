import { describe, expect, it } from 'vitest';

import {
  classifyHeatmapExposure,
  createHeatmapCacheKey,
  getHeatmapGroupKey,
} from './sunlightHeatmap';

describe('sunlight heatmap', () => {
  it('classifies representative exposure without ambiguous boundary states', () => {
    expect(classifyHeatmapExposure(100, 20)).toBe('mostly-sunny');
    expect(classifyHeatmapExposure(60, 60)).toBe('partially-sunny');
    expect(classifyHeatmapExposure(20, 100)).toBe('mostly-shaded');
    expect(classifyHeatmapExposure(0, 120)).toBe('fully-shaded');
  });

  it('separates cached results by time, config version, and resolution', () => {
    const sectionKey = createHeatmapCacheKey(
      'geometry-2',
      '2026-08-24T16:00:00+01:00',
      '2026-08-24T18:00:00+01:00',
      'section',
    );
    const rowKey = createHeatmapCacheKey(
      'geometry-2',
      '2026-08-24T16:00:00+01:00',
      '2026-08-24T18:00:00+01:00',
      'row',
    );
    expect(sectionKey).not.toBe(rowKey);
    expect(sectionKey).toContain('geometry-2');
  });

  it('invalidates instant snapshots when the preview time changes', () => {
    const morningKey = createHeatmapCacheKey(
      'geometry-2',
      '2026-08-24T16:00:00+01:00',
      '2026-08-24T18:00:00+01:00',
      'section',
      'instant',
      '2026-08-24T09:00:00+01:00',
    );
    const eveningKey = createHeatmapCacheKey(
      'geometry-2',
      '2026-08-24T16:00:00+01:00',
      '2026-08-24T18:00:00+01:00',
      'section',
      'instant',
      '2026-08-24T18:00:00+01:00',
    );

    expect(morningKey).not.toBe(eveningKey);
    expect(morningKey).toContain('physics-2');
  });

  it('uses section and row group keys at their requested resolution', () => {
    expect(getHeatmapGroupKey('lower-01', 4, 'section')).toBe('lower-01');
    expect(getHeatmapGroupKey('lower-01', 4, 'row')).toBe('lower-01:row-4');
  });
});
