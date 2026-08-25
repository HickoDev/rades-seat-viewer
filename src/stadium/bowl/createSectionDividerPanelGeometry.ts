import { BufferGeometry, Float32BufferAttribute } from 'three';

import type { StadiumConfig } from '../types/stadium.types';
import { getTierAisleWidth } from './tierAccess';

type TierConfig = StadiumConfig['tiers'][number];
type BarrierConfig = StadiumConfig['bowlDetails'];

function tierPoint(tier: TierConfig, angle: number, rowIndex: number) {
  const radiusX = tier.startRadiusX + (rowIndex + 0.5) * tier.rowDepth;
  const radiusZ = tier.startRadiusZ + (rowIndex + 0.5) * tier.rowDepth;
  return [
    Math.cos(angle) * radiusX,
    tier.baseHeight + (rowIndex + 1) * tier.rowHeight,
    Math.sin(angle) * radiusZ,
  ] as const;
}

export function createSectionDividerPanelGeometry(
  tier: TierConfig,
  barrier: BarrierConfig,
) {
  const positions: number[] = [];
  const indices: number[] = [];
  const sectionAngle = (Math.PI * 2) / tier.sectionCount;
  const averageRadius = (tier.startRadiusX + tier.startRadiusZ) / 2;
  const panelHeight = barrier.sectionBarrierHeight * 0.54;

  for (
    let sectionIndex = 0;
    sectionIndex < tier.sectionCount;
    sectionIndex += 1
  ) {
    const boundaryAngle = sectionIndex * sectionAngle;
    const aisleAngle = getTierAisleWidth(tier, sectionIndex) / averageRadius;

    for (const side of [-1, 1] as const) {
      const angle = boundaryAngle + side * aisleAngle * 0.54;
      const start = tierPoint(tier, angle, 0);
      const end = tierPoint(tier, angle, tier.rowCount - 1);
      const offset = positions.length / 3;
      positions.push(
        ...start,
        ...end,
        start[0],
        start[1] + panelHeight,
        start[2],
        end[0],
        end[1] + panelHeight,
        end[2],
      );
      indices.push(
        offset,
        offset + 1,
        offset + 2,
        offset + 2,
        offset + 1,
        offset + 3,
      );
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}
