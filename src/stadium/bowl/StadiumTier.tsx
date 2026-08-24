import { useEffect, useMemo } from 'react';
import { MeshStandardMaterial } from 'three';

import { useStadiumStore } from '../../state/useStadiumStore';
import type { StadiumConfig } from '../types/stadium.types';
import { createTierGeometry } from './createTierGeometry';
import { getSectionId } from './sectionIds';

type TierConfig = StadiumConfig['tiers'][number];

type StadiumTierProps = {
  tier: TierConfig;
};

export function StadiumTier({ tier }: StadiumTierProps) {
  const selectedSectionId = useStadiumStore((state) => state.selectedSectionId);
  const selectSection = useStadiumStore((state) => state.selectSection);
  const sectionAngle = (Math.PI * 2) / tier.sectionCount;
  const averageRadius = (tier.startRadiusX + tier.startRadiusZ) / 2;
  const aisleAngle = tier.aisleWidth / averageRadius;

  const geometries = useMemo(
    () =>
      Array.from({ length: tier.sectionCount }, (_, sectionIndex) => {
        const startAngle = sectionIndex * sectionAngle;
        const centerAngle = startAngle + sectionAngle / 2;
        const hasVomitory = sectionIndex % tier.vomitoryEverySections === 0;
        const portalRadius =
          (tier.startRadiusX + tier.startRadiusZ) / 2 +
          tier.vomitoryRow * tier.rowDepth;
        return createTierGeometry({
          startAngle: startAngle + aisleAngle / 2,
          endAngle: startAngle + sectionAngle - aisleAngle / 2,
          startRadiusX: tier.startRadiusX,
          startRadiusZ: tier.startRadiusZ,
          baseHeight: tier.baseHeight,
          rowCount: tier.rowCount,
          rowDepth: tier.rowDepth,
          rowHeight: tier.rowHeight,
          angularSegments: 24,
          opening: hasVomitory
            ? {
                centerAngle,
                angularWidth: tier.vomitoryWidth / portalRadius,
                startRow: tier.vomitoryRow,
                rowCount: Math.ceil(tier.vomitoryHeight / tier.rowHeight),
              }
            : undefined,
        });
      }),
    [aisleAngle, sectionAngle, tier],
  );

  const materials = useMemo(
    () => ({
      primary: new MeshStandardMaterial({
        color: '#718078',
        roughness: 0.93,
      }),
      secondary: new MeshStandardMaterial({
        color: '#67756e',
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
              selectSection(sectionId);
            }}
            receiveShadow
            userData={{
              sectionId,
              tierId: tier.id,
            }}
          />
        );
      })}
    </group>
  );
}
