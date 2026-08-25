import type { StadiumConfig } from '../types/stadium.types';

type TierConfig = StadiumConfig['tiers'][number];

export type TierAccessOpening = {
  sectionIndex: number;
  row: number;
  width: number;
  height: number;
  depth: number;
  frameThickness: number;
};

export type TierMajorCutout = TierConfig['majorCutouts'][number];

function normalizeBoundaryIndex(tier: TierConfig, boundaryIndex: number) {
  return (
    ((boundaryIndex % tier.sectionCount) + tier.sectionCount) %
    tier.sectionCount
  );
}

export function getTierAisleWidth(tier: TierConfig, boundaryIndex: number) {
  const normalizedIndex = normalizeBoundaryIndex(tier, boundaryIndex);
  const majorCutout = tier.majorCutouts.find(
    (cutout) => cutout.boundaryIndex === normalizedIndex,
  );
  if (majorCutout) return majorCutout.width;
  return (
    tier.aisleWidthOverrides.find(
      (override) => override.boundaryIndex === normalizedIndex,
    )?.width ?? tier.aisleWidth
  );
}

export function getTierMajorCutout(
  tier: TierConfig,
  boundaryIndex: number,
): TierMajorCutout | null {
  const normalizedIndex = normalizeBoundaryIndex(tier, boundaryIndex);
  return (
    tier.majorCutouts.find(
      (cutout) => cutout.boundaryIndex === normalizedIndex,
    ) ?? null
  );
}

export function getTierAccessOpening(
  tier: TierConfig,
  sectionIndex: number,
): TierAccessOpening | null {
  if (!tier.vomitorySectionIndices.includes(sectionIndex)) return null;

  const override = tier.vomitoryOverrides.find(
    (candidate) => candidate.sectionIndex === sectionIndex,
  );

  return {
    sectionIndex,
    row: override?.row ?? tier.vomitoryRow,
    width: override?.width ?? tier.vomitoryWidth,
    height: override?.height ?? tier.vomitoryHeight,
    depth: override?.depth ?? tier.vomitoryDepth,
    frameThickness: override?.frameThickness ?? tier.vomitoryFrameThickness,
  };
}
