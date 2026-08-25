import { getSectionId } from '../stadium/bowl/sectionIds';
import { getInteriorSectionZone } from '../stadium/bowl/sectionZones';
import type { StadiumConfig } from '../stadium/types/stadium.types';
import { classifyHeatmapExposure } from '../sunlight/sunlightHeatmap';
import type {
  HeatmapClassification,
  SunHeatmapCell,
} from '../sunlight/sunlightHeatmap.types';

type TierConfig = StadiumConfig['tiers'][number];

export type ExposureMapSection = {
  id: string;
  tierId: string;
  tierName: string;
  zoneLabel: string;
  sectionNumber: number;
  visitorClosed: boolean;
  classification: HeatmapClassification | null;
  directSunMinutes: number;
  shadedMinutes: number;
  exposedPercent: number;
  samples: SunHeatmapCell[];
};

export function buildExposureMapSections(
  cells: SunHeatmapCell[],
  config: Pick<StadiumConfig, 'tiers' | 'grandstand'>,
): ExposureMapSection[] {
  const cellsBySection = new Map<string, SunHeatmapCell[]>();

  cells.forEach((cell) => {
    const existing = cellsBySection.get(cell.sectionId) ?? [];
    existing.push(cell);
    cellsBySection.set(cell.sectionId, existing);
  });

  return config.tiers.flatMap((tier) =>
    Array.from({ length: tier.sectionCount }, (_, sectionIndex) => {
      const id = getSectionId(tier.id, sectionIndex);
      const samples = [...(cellsBySection.get(id) ?? [])].sort(
        (left, right) => (left.rowNumber ?? 0) - (right.rowNumber ?? 0),
      );
      const sampleCount = samples.length;
      const directSunMinutes = sampleCount
        ? samples.reduce((sum, sample) => sum + sample.directSunMinutes, 0) /
          sampleCount
        : 0;
      const shadedMinutes = sampleCount
        ? samples.reduce((sum, sample) => sum + sample.shadedMinutes, 0) /
          sampleCount
        : 0;
      const exposedPercent = sampleCount
        ? samples.reduce((sum, sample) => sum + sample.exposedPercent, 0) /
          sampleCount
        : 0;
      const zone = getInteriorSectionZone(
        tier,
        sectionIndex,
        config.grandstand,
      );

      return {
        id,
        tierId: tier.id,
        tierName: tier.name,
        zoneLabel: zone.label,
        sectionNumber: sectionIndex + 1,
        visitorClosed:
          tier.closedToVisitorsSectionIndices.includes(sectionIndex),
        classification: sampleCount
          ? classifyHeatmapExposure(directSunMinutes, shadedMinutes)
          : null,
        directSunMinutes,
        shadedMinutes,
        exposedPercent,
        samples,
      };
    }),
  );
}

type EllipticalSegmentOptions = {
  centerX: number;
  centerY: number;
  innerRadiusX: number;
  innerRadiusY: number;
  outerRadiusX: number;
  outerRadiusY: number;
  startAngle: number;
  endAngle: number;
  samples?: number;
};

export function createEllipticalSegmentPoints({
  centerX,
  centerY,
  innerRadiusX,
  innerRadiusY,
  outerRadiusX,
  outerRadiusY,
  startAngle,
  endAngle,
  samples = 5,
}: EllipticalSegmentOptions) {
  const safeSamples = Math.max(2, Math.round(samples));
  const outerPoints = Array.from({ length: safeSamples }, (_, index) => {
    const progress = index / (safeSamples - 1);
    const angle = startAngle + (endAngle - startAngle) * progress;
    return [
      centerX + Math.cos(angle) * outerRadiusX,
      centerY + Math.sin(angle) * outerRadiusY,
    ];
  });
  const innerPoints = Array.from({ length: safeSamples }, (_, index) => {
    const progress = index / (safeSamples - 1);
    const angle = endAngle - (endAngle - startAngle) * progress;
    return [
      centerX + Math.cos(angle) * innerRadiusX,
      centerY + Math.sin(angle) * innerRadiusY,
    ];
  });

  return [...outerPoints, ...innerPoints]
    .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ');
}

export function getTierForMap(
  tiers: StadiumConfig['tiers'],
  tierId: string,
): TierConfig | undefined {
  return tiers.find((tier) => tier.id === tierId);
}
