import { Matrix4, Quaternion, Vector3 } from 'three';

import type { StadiumConfig } from '../stadium/types/stadium.types';
import { getSectionId } from '../stadium/bowl/sectionIds';
import { getStadiumPerimeterPoint } from '../stadium/geometry/stadiumPerimeter';
import {
  getTierAccessOpening,
  getTierAisleWidth,
} from '../stadium/bowl/tierAccess';
import { angleAtArcLength, arcLengthAtAngle } from './ellipticalArcTable';
import { createStadiumArcTable } from './stadiumArcTable';
import type { SeatLayout, SeatMetadata } from './seat.types';

const upAxis = new Vector3(0, 1, 0);
const unitScale = new Vector3(1, 1, 1);

export type SeatLayoutGenerationOptions = {
  /** Internal spectator placements may occupy seatless concrete terraces. */
  includeSeatlessSections?: boolean;
};

export function generateSeatLayout(
  config: StadiumConfig,
  options: SeatLayoutGenerationOptions = {},
): SeatLayout {
  const metadata: SeatMetadata[] = [];
  const matrixValues: number[] = [];
  const matrix = new Matrix4();
  const quaternion = new Quaternion();
  const position = new Vector3();

  for (const tier of config.tiers) {
    const sectionAngle = (Math.PI * 2) / tier.sectionCount;

    for (let rowIndex = 0; rowIndex < tier.rowCount; rowIndex += 1) {
      const radiusX = tier.startRadiusX + (rowIndex + 0.5) * tier.rowDepth;
      const radiusZ = tier.startRadiusZ + (rowIndex + 0.5) * tier.rowDepth;
      const averageRadius = (radiusX + radiusZ) / 2;
      const arcTable = createStadiumArcTable(
        radiusX,
        radiusZ,
        config.seats.arcTableSamples,
      );
      const seatY = tier.baseHeight + (rowIndex + 1) * tier.rowHeight + 0.02;

      for (
        let sectionIndex = 0;
        sectionIndex < tier.sectionCount;
        sectionIndex += 1
      ) {
        if (
          !options.includeSeatlessSections &&
          tier.seatlessSectionIndices.includes(sectionIndex)
        ) {
          continue;
        }

        const sectionId = getSectionId(tier.id, sectionIndex);
        const startAisleAngle =
          getTierAisleWidth(tier, sectionIndex) / averageRadius;
        const endAisleAngle =
          getTierAisleWidth(tier, sectionIndex + 1) / averageRadius;
        const sectionStartAngle =
          sectionIndex * sectionAngle + startAisleAngle / 2;
        const sectionEndAngle =
          (sectionIndex + 1) * sectionAngle - endAisleAngle / 2;
        const opening = getTierAccessOpening(tier, sectionIndex);
        const portalRowCount = opening
          ? Math.ceil(opening.height / tier.rowHeight)
          : 0;
        const startDistance = arcLengthAtAngle(arcTable, sectionStartAngle);
        const endDistance = arcLengthAtAngle(arcTable, sectionEndAngle);
        const sectionLength = endDistance - startDistance;
        const seatCount = Math.max(
          1,
          Math.floor(sectionLength / config.seats.spacing),
        );
        const physicalSpacing = sectionLength / seatCount;
        let seatNumber = 0;

        for (let seatIndex = 0; seatIndex < seatCount; seatIndex += 1) {
          const distance = startDistance + (seatIndex + 0.5) * physicalSpacing;
          const angle = angleAtArcLength(arcTable, distance);
          const isPortalRow =
            opening !== null &&
            rowIndex >= opening.row &&
            rowIndex < opening.row + portalRowCount;
          const portalCenterDistance = (startDistance + endDistance) / 2;
          const isInsidePortal =
            isPortalRow &&
            Math.abs(distance - portalCenterDistance) < opening.width / 2;

          if (isInsidePortal) {
            continue;
          }

          const perimeterPoint = getStadiumPerimeterPoint(
            angle,
            radiusX,
            radiusZ,
          );
          const { x, z } = perimeterPoint;
          const isInsidePlayerTunnelClearance =
            tier.id === 'lower' &&
            rowIndex < config.grandstand.playerTunnelSeatClearanceRows &&
            z * config.grandstand.side > 0 &&
            Math.abs(x) < config.grandstand.playerTunnelWidth / 2;
          if (isInsidePlayerTunnelClearance) {
            continue;
          }
          const isInsideGrandstandFacilityClearance =
            tier.id === 'upper' &&
            rowIndex < config.grandstand.upperTierSeatClearanceRows &&
            config.grandstand.sectionIndices.includes(sectionIndex);
          if (isInsideGrandstandFacilityClearance) {
            continue;
          }

          seatNumber += 1;
          const rotationY = Math.atan2(-x, -z);
          const seat: SeatMetadata = {
            id: `${sectionId}-r${rowIndex + 1}-s${seatNumber}`,
            sectionId,
            tierId: tier.id,
            rowNumber: rowIndex + 1,
            seatNumber,
            position: [x, seatY, z],
            rotationY,
          };

          metadata.push(seat);
          position.set(x, seatY, z);
          quaternion.setFromAxisAngle(upAxis, rotationY);
          matrix.compose(position, quaternion, unitScale);
          matrix.toArray(matrixValues, matrixValues.length);
        }
      }
    }
  }

  return {
    metadata,
    matrices: Float32Array.from(matrixValues),
  };
}
