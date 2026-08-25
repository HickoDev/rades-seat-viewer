import { describe, expect, it } from 'vitest';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { createConcourseFeatureMatrices } from './createConcourseFeatureMatrices';
import { createSectionDividerPanelGeometry } from './createSectionDividerPanelGeometry';
import { createSectionBarrierMatrices } from './createSectionBarrierMatrices';
import { createVomitoryFeatureMatrices } from './createVomitoryFeatureMatrices';
import {
  getTierAccessOpening,
  getTierAisleWidth,
  getTierMajorCutout,
} from './tierAccess';

const lowerTier = radesStadiumConfig.tiers[0];
const upperTier = radesStadiumConfig.tiers[1];
const details = radesStadiumConfig.bowlDetails;

describe('procedural bowl details', () => {
  it('places finite barrier rails and posts along every section aisle edge', () => {
    const matrices = createSectionBarrierMatrices(lowerTier, details);

    expect(matrices.length).toBeGreaterThan(lowerTier.sectionCount * 4);
    expect(
      matrices.every((matrix) => matrix.elements.every(Number.isFinite)),
    ).toBe(true);
  });

  it('adds solid divider panels between every section', () => {
    const geometry = createSectionDividerPanelGeometry(lowerTier, details);
    const positions = geometry.getAttribute('position');

    expect(positions.count).toBe(lowerTier.sectionCount * 2 * 4);
    expect(Array.from(positions.array).every(Number.isFinite)).toBe(true);
    geometry.dispose();
  });

  it('creates one framed, lit vomitory treatment per configured portal', () => {
    const features = createVomitoryFeatureMatrices(lowerTier);
    const portalCount = lowerTier.vomitorySectionIndices.length;

    expect(features.panels).toHaveLength(portalCount);
    expect(features.floors).toHaveLength(portalCount);
    expect(features.frames).toHaveLength(portalCount * 3);
    expect(features.signs).toHaveLength(portalCount);
  });

  it('supports explicit wide portals and stair wedges per section', () => {
    const standardOpening = getTierAccessOpening(lowerTier, 1);
    const wideOpening = getTierAccessOpening(lowerTier, 6);

    expect(standardOpening?.width).toBe(lowerTier.vomitoryWidth);
    expect(wideOpening?.width).toBeGreaterThan(lowerTier.vomitoryWidth);
    expect(getTierAccessOpening(lowerTier, 2)).toBeNull();
    expect(getTierAisleWidth(lowerTier, 4)).toBeGreaterThan(
      lowerTier.aisleWidth,
    );
    expect(getTierAisleWidth(lowerTier, lowerTier.sectionCount + 4)).toBe(
      getTierAisleWidth(lowerTier, 4),
    );
  });

  it('reserves four full-depth lower-tier cuts beside the virages', () => {
    expect(lowerTier.majorCutouts).toHaveLength(4);
    lowerTier.majorCutouts.forEach((cutout) => {
      expect(getTierMajorCutout(lowerTier, cutout.boundaryIndex)).toEqual(
        cutout,
      );
      expect(getTierAisleWidth(lowerTier, cutout.boundaryIndex)).toBe(
        cutout.width,
      );
    });
    expect(upperTier.majorCutouts).toHaveLength(0);
  });

  it('fills the tier break with repeated framed concourse portals and lights', () => {
    const features = createConcourseFeatureMatrices(
      upperTier,
      lowerTier,
      details,
    );

    expect(features.concourse.height).toBeGreaterThan(0);
    expect(features.portals).toHaveLength(upperTier.sectionCount);
    expect(features.portalFrames).toHaveLength(upperTier.sectionCount);
    expect(features.signs).toHaveLength(upperTier.sectionCount);
    expect(features.lights).toHaveLength(upperTier.sectionCount);
  });
});
