import { BufferGeometry, Float32BufferAttribute } from 'three';

import type { StadiumConfig } from '../types/stadium.types';
import {
  getStadiumPerimeterAngleForDistance,
  getStadiumPerimeterPoint,
} from '../geometry/stadiumPerimeter';
import { getTierAisleWidth, getTierMajorCutout } from './tierAccess';

type TierConfig = StadiumConfig['tiers'][number];
type BarrierConfig = StadiumConfig['bowlDetails'];

function tierPoint(tier: TierConfig, angle: number, rowIndex: number) {
  const radiusX = tier.startRadiusX + (rowIndex + 0.5) * tier.rowDepth;
  const radiusZ = tier.startRadiusZ + (rowIndex + 0.5) * tier.rowDepth;
  const point = getStadiumPerimeterPoint(angle, radiusX, radiusZ);
  return [
    point.x,
    tier.baseHeight + (rowIndex + 1) * tier.rowHeight,
    point.z,
  ] as const;
}

export function createSectionDividerPanelGeometry(
  tier: TierConfig,
  barrier: BarrierConfig,
) {
  const positions: number[] = [];
  const indices: number[] = [];
  const sectionAngle = (Math.PI * 2) / tier.sectionCount;
  for (
    let sectionIndex = 0;
    sectionIndex < tier.sectionCount;
    sectionIndex += 1
  ) {
    // The wide virage separations are open voids with edge railings. A solid
    // divider here reads as a broad grey stair or slab when seen obliquely.
    if (getTierMajorCutout(tier, sectionIndex)) continue;

    const boundaryAngle = sectionIndex * sectionAngle;
    const aisleAngle = getStadiumPerimeterAngleForDistance(
      getTierAisleWidth(tier, sectionIndex),
      tier.startRadiusX,
      tier.startRadiusZ,
    );
    const panelHeight = barrier.sectionBarrierHeight * 0.54;

    for (const side of [-1, 1] as const) {
      const angle = boundaryAngle + side * aisleAngle * 0.5;
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
