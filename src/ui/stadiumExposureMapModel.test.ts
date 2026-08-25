import { describe, expect, it } from 'vitest';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import type { SunHeatmapCell } from '../sunlight/sunlightHeatmap.types';
import {
  buildExposureMapSections,
  createEllipticalSegmentPoints,
} from './stadiumExposureMapModel';

function createCell(
  rowNumber: number,
  directSunMinutes: number,
  shadedMinutes: number,
): SunHeatmapCell {
  return {
    key: `lower-01:row-${rowNumber}`,
    sectionId: 'lower-01',
    tierId: 'lower',
    rowNumber,
    representativeSeatId: `lower-01-r${rowNumber}-s1`,
    classification: 'partially-sunny',
    directSunMinutes,
    shadedMinutes,
    exposedPercent:
      (directSunMinutes / (directSunMinutes + shadedMinutes)) * 100,
  };
}

describe('stadium exposure map model', () => {
  it('aggregates row samples into every configured top-view section', () => {
    const sections = buildExposureMapSections(
      [createCell(1, 80, 20), createCell(2, 20, 80)],
      radesStadiumConfig,
    );
    const section = sections.find((candidate) => candidate.id === 'lower-01');

    expect(sections).toHaveLength(
      radesStadiumConfig.tiers.reduce(
        (sum, tier) => sum + tier.sectionCount,
        0,
      ),
    );
    expect(section).toMatchObject({
      classification: 'partially-sunny',
      directSunMinutes: 50,
      shadedMinutes: 50,
      exposedPercent: 50,
      zoneLabel: 'Virage 1 · Terrasse debout',
    });
    expect(section?.samples.map((sample) => sample.rowNumber)).toEqual([1, 2]);
  });

  it('creates a finite closed polygon for an elliptical tier segment', () => {
    const points = createEllipticalSegmentPoints({
      centerX: 250,
      centerY: 170,
      innerRadiusX: 140,
      innerRadiusY: 76,
      outerRadiusX: 171,
      outerRadiusY: 105,
      startAngle: 0,
      endAngle: Math.PI / 16,
    });

    expect(points.split(' ')).toHaveLength(10);
    expect(points).not.toMatch(/NaN|Infinity/);
  });
});
