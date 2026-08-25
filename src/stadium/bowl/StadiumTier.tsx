import { useEffect, useMemo } from 'react';
import { MeshStandardMaterial } from 'three';

import { findRepresentativeTerracePosition } from '../../seats/viewingPositions';
import { useStadiumStore } from '../../state/useStadiumStore';
import { radesStadiumConfig } from '../config/radesStadiumConfig';
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
  const averageRadius = (tier.startRadiusX + tier.startRadiusZ) / 2;

  const geometries = useMemo(
    () =>
      Array.from({ length: tier.sectionCount }, (_, sectionIndex) => {
        const startAngle = sectionIndex * sectionAngle;
        const centerAngle = startAngle + sectionAngle / 2;
        const opening = getTierAccessOpening(tier, sectionIndex);
        const startAisleAngle =
          getTierAisleWidth(tier, sectionIndex) / averageRadius;
        const endAisleAngle =
          getTierAisleWidth(tier, sectionIndex + 1) / averageRadius;
        const portalRadius =
          (tier.startRadiusX + tier.startRadiusZ) / 2 +
          (opening?.row ?? 0) * tier.rowDepth;
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
                angularWidth: opening.width / portalRadius,
                startRow: opening.row,
                rowCount: Math.ceil(opening.height / tier.rowHeight),
              }
            : undefined,
        });
      }),
    [averageRadius, sectionAngle, tier],
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
        const zone = getInteriorSectionZone(
          tier,
          sectionIndex,
          radesStadiumConfig.grandstand,
        );

        return (
          <mesh
            key={sectionId}
            geometry={geometry}
            material={
              isSelected
                ? materials.selected
                : sectionIndex % 2 === 0
                  ? materials.primary
                  : materials.secondary
            }
            name={`section-${sectionId}`}
            onClick={(event) => {
              event.stopPropagation();
              const terracePosition = isTerrace
                ? findRepresentativeTerracePosition(sectionId)
                : null;
              if (terracePosition) {
                selectTerracePosition(
                  sectionId,
                  terracePosition.rowNumber,
                  terracePosition.seatNumber,
                );
              } else {
                selectSection(sectionId);
              }
            }}
            receiveShadow
            userData={{
              sectionId,
              tierId: tier.id,
              sectionZoneId: zone.id,
              sectionLabel: zone.label,
              viewingArea: isTerrace ? 'terrace' : 'seated',
            }}
          />
        );
      })}
    </group>
  );
}
