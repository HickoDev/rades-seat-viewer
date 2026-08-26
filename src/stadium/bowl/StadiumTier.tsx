import { useEffect, useMemo } from 'react';
import { MeshStandardMaterial } from 'three';

import {
  findClosestOpenTerracePosition,
  findRepresentativeTerracePosition,
} from '../../seats/viewingPositions';
import { useStadiumStore } from '../../state/useStadiumStore';
import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { getStadiumPerimeterAngleForDistance } from '../geometry/stadiumPerimeter';
import type { StadiumConfig } from '../types/stadium.types';
import { createTierGeometry } from './createTierGeometry';
import { getSectionId } from './sectionIds';
import { getInteriorSectionZone } from './sectionZones';
import { getTierAccessOpening, getTierAisleWidth } from './tierAccess';

type TierConfig = StadiumConfig['tiers'][number];

type StadiumTierProps = {
  tier: TierConfig;
};

export function StadiumTier({ tier }: StadiumTierProps) {
  const selectedSectionId = useStadiumStore((state) => state.selectedSectionId);
  const selectSection = useStadiumStore((state) => state.selectSection);
  const selectTerracePosition = useStadiumStore(
    (state) => state.selectTerracePosition,
  );
  const sectionAngle = (Math.PI * 2) / tier.sectionCount;

  const geometries = useMemo(
    () =>
      Array.from({ length: tier.sectionCount }, (_, sectionIndex) => {
        const startAngle = sectionIndex * sectionAngle;
        const centerAngle = startAngle + sectionAngle / 2;
        const opening = getTierAccessOpening(tier, sectionIndex);
        const startAisleAngle = getStadiumPerimeterAngleForDistance(
          getTierAisleWidth(tier, sectionIndex),
          tier.startRadiusX,
          tier.startRadiusZ,
        );
        const endAisleAngle = getStadiumPerimeterAngleForDistance(
          getTierAisleWidth(tier, sectionIndex + 1),
          tier.startRadiusX,
          tier.startRadiusZ,
        );
        const portalExtentX =
          tier.startRadiusX + (opening?.row ?? 0) * tier.rowDepth;
        const portalExtentZ =
          tier.startRadiusZ + (opening?.row ?? 0) * tier.rowDepth;
        return createTierGeometry({
          startAngle: startAngle + startAisleAngle / 2,
          endAngle: startAngle + sectionAngle - endAisleAngle / 2,
          startRadiusX: tier.startRadiusX,
          startRadiusZ: tier.startRadiusZ,
          baseHeight: tier.baseHeight,
          rowCount: tier.rowCount,
          rowDepth: tier.rowDepth,
          rowHeight: tier.rowHeight,
          angularSegments: 24,
          opening: opening
            ? {
                centerAngle,
                angularWidth: getStadiumPerimeterAngleForDistance(
                  opening.width,
                  portalExtentX,
                  portalExtentZ,
                ),
                startRow: opening.row,
                rowCount: Math.ceil(opening.height / tier.rowHeight),
              }
            : undefined,
        });
      }),
    [sectionAngle, tier],
  );

  const materials = useMemo(
    () => ({
      primary: new MeshStandardMaterial({
        color: '#aaa99f',
        roughness: 0.93,
      }),
      secondary: new MeshStandardMaterial({
        color: '#9fa199',
        roughness: 0.93,
      }),
      closed: new MeshStandardMaterial({
        color: '#587a7c',
        emissive: '#172b2e',
        emissiveIntensity: 0.08,
        roughness: 0.95,
      }),
      selected: new MeshStandardMaterial({
        color: '#bfe961',
        emissive: '#263b12',
        emissiveIntensity: 0.28,
        roughness: 0.82,
      }),
    }),
    [],
  );

  useEffect(
    () => () => {
      geometries.forEach((geometry) => geometry.dispose());
      Object.values(materials).forEach((material) => material.dispose());
    },
    [geometries, materials],
  );

  return (
    <group name={`${tier.id}-tier`} dispose={null}>
      {geometries.map((geometry, sectionIndex) => {
        const sectionId = getSectionId(tier.id, sectionIndex);
        const isSelected = selectedSectionId === sectionId;
        const isTerrace = tier.seatlessSectionIndices.includes(sectionIndex);
        const isClosedToVisitors =
          tier.closedToVisitorsSectionIndices.includes(sectionIndex);
        const zone = getInteriorSectionZone(
          tier,
          sectionIndex,
          radesStadiumConfig.grandstand,
        );
        const terracePosition = isTerrace
          ? findRepresentativeTerracePosition(sectionId)
          : zone.id === 'closed-upper-virage'
            ? findClosestOpenTerracePosition(sectionId)
            : null;
        const isClickable = !isClosedToVisitors || terracePosition !== null;

        return (
          <mesh
            key={sectionId}
            geometry={geometry}
            material={
              isSelected
                ? materials.selected
                : isClosedToVisitors
                  ? materials.closed
                  : sectionIndex % 2 === 0
                    ? materials.primary
                    : materials.secondary
            }
            name={`section-${sectionId}`}
            onClick={(event) => {
              event.stopPropagation();
              if (terracePosition) {
                selectTerracePosition(
                  terracePosition.sectionId,
                  terracePosition.rowNumber,
                  terracePosition.seatNumber,
                );
              } else if (!isClosedToVisitors) {
                selectSection(sectionId);
              }
            }}
            onPointerOut={() => {
              document.body.style.cursor = '';
            }}
            onPointerOver={(event) => {
              event.stopPropagation();
              document.body.style.cursor = isClickable ? 'pointer' : '';
            }}
            receiveShadow
            userData={{
              sectionId,
              tierId: tier.id,
              sectionZoneId: zone.id,
              sectionLabel: zone.label,
              viewingArea: zone.viewingArea,
              accessStatus: isClosedToVisitors
                ? 'closed-to-visitors'
                : 'open-to-visitors',
              clickAction:
                isClosedToVisitors && terracePosition
                  ? 'open-nearest-lower-virage-pov'
                  : isClickable
                    ? 'open-section'
                    : 'none',
            }}
          />
        );
      })}
    </group>
  );
}
