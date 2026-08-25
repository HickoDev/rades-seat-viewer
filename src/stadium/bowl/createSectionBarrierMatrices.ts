import { Vector3, type Matrix4 } from 'three';

import { createCylinderBetweenMatrix } from '../../utils/geometry';
import type { StadiumConfig } from '../types/stadium.types';
import { getTierAisleWidth } from './tierAccess';

type TierConfig = StadiumConfig['tiers'][number];
type BarrierConfig = StadiumConfig['bowlDetails'];

function getTierPoint(
  tier: TierConfig,
  angle: number,
  rowIndex: number,
  heightOffset: number,
) {
  const radiusX = tier.startRadiusX + (rowIndex + 0.5) * tier.rowDepth;
  const radiusZ = tier.startRadiusZ + (rowIndex + 0.5) * tier.rowDepth;
  return new Vector3(
    Math.cos(angle) * radiusX,
    tier.baseHeight + (rowIndex + 1) * tier.rowHeight + heightOffset,
    Math.sin(angle) * radiusZ,
  );
}

export function createSectionBarrierMatrices(
  tier: TierConfig,
  barrier: BarrierConfig,
): Matrix4[] {
  const matrices: Matrix4[] = [];
  const sectionAngle = (Math.PI * 2) / tier.sectionCount;
  const averageRadius = (tier.startRadiusX + tier.startRadiusZ) / 2;
  const postRows = Array.from(
    { length: Math.ceil(tier.rowCount / barrier.sectionBarrierPostEveryRows) },
    (_, index) =>
      Math.min(index * barrier.sectionBarrierPostEveryRows, tier.rowCount - 1),
  );
  if (postRows.at(-1) !== tier.rowCount - 1) {
    postRows.push(tier.rowCount - 1);
  }

  for (
    let sectionIndex = 0;
    sectionIndex < tier.sectionCount;
    sectionIndex += 1
  ) {
    const boundaryAngle = sectionIndex * sectionAngle;
    const aisleAngle = getTierAisleWidth(tier, sectionIndex) / averageRadius;

    for (const side of [-1, 1] as const) {
      const angle = boundaryAngle + side * aisleAngle * 0.54;
      const startRow = 0;
      const endRow = tier.rowCount - 1;

      for (const heightRatio of [barrier.sectionBarrierMidRailRatio, 1]) {
        matrices.push(
          createCylinderBetweenMatrix(
            getTierPoint(
              tier,
              angle,
              startRow,
              barrier.sectionBarrierHeight * heightRatio,
            ),
            getTierPoint(
              tier,
              angle,
              endRow,
              barrier.sectionBarrierHeight * heightRatio,
            ),
            barrier.sectionBarrierRailRadius,
          ),
        );
      }

      postRows.forEach((rowIndex) => {
        matrices.push(
          createCylinderBetweenMatrix(
            getTierPoint(tier, angle, rowIndex, 0.04),
            getTierPoint(tier, angle, rowIndex, barrier.sectionBarrierHeight),
            barrier.sectionBarrierRailRadius,
          ),
        );
      });
    }
  }

  return matrices;
}
