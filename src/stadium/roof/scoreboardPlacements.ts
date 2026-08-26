import type { StadiumConfig } from '../types/stadium.types';
import { getStadiumPerimeterPoint } from '../geometry/stadiumPerimeter';

export type ScoreboardPlacement = {
  side: -1 | 1;
  position: [number, number, number];
  rotationY: number;
  terraceHeight: number;
  supportHeight: number;
};

/**
 * Places the two end displays on upper-virage terrace rows. The placement is
 * shared by the visible model and sunlight occluders so the screen never casts
 * a shadow from its former roof-suspended position.
 */
export function createScoreboardPlacements(
  config: Pick<StadiumConfig, 'structure' | 'tiers'>,
): ScoreboardPlacement[] {
  const upperTier = config.tiers.find((tier) => tier.id === 'upper');
  if (!upperTier) return [];

  const rowIndex = Math.min(
    Math.max(Math.round(config.structure.scoreboardTerraceRow), 0),
    upperTier.rowCount - 1,
  );
  const radiusX = upperTier.startRadiusX + rowIndex * upperTier.rowDepth;
  const radiusZ = upperTier.startRadiusZ + rowIndex * upperTier.rowDepth;
  const terraceHeight =
    upperTier.baseHeight + (rowIndex + 1) * upperTier.rowHeight;
  const supportHeight = config.structure.scoreboardBaseClearance;
  const centerY =
    terraceHeight + supportHeight + config.structure.scoreboardHeight / 2;

  return ([-1, 1] as const).map((side) => {
    const angle = side === 1 ? 0 : Math.PI;
    const point = getStadiumPerimeterPoint(angle, radiusX, radiusZ);
    return {
      side,
      position: [point.x, centerY, point.z],
      rotationY: side === -1 ? Math.PI / 2 : -Math.PI / 2,
      terraceHeight,
      supportHeight,
    };
  });
}
