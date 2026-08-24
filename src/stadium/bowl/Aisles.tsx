import { useEffect, useMemo } from 'react';
import { MeshStandardMaterial } from 'three';

import type { StadiumConfig } from '../types/stadium.types';
import { createTierGeometry } from './createTierGeometry';

type TierConfig = StadiumConfig['tiers'][number];

export function Aisles({ tier }: { tier: TierConfig }) {
  const sectionAngle = (Math.PI * 2) / tier.sectionCount;
  const averageRadius = (tier.startRadiusX + tier.startRadiusZ) / 2;
  const aisleAngle = tier.aisleWidth / averageRadius;
  const material = useMemo(
    () => new MeshStandardMaterial({ color: '#aeb7b1', roughness: 0.96 }),
    [],
  );
  const geometries = useMemo(
    () =>
      Array.from({ length: tier.sectionCount }, (_, sectionIndex) => {
        const boundary = sectionIndex * sectionAngle;
        return createTierGeometry({
          startAngle: boundary - aisleAngle / 2,
          endAngle: boundary + aisleAngle / 2,
          startRadiusX: tier.startRadiusX,
          startRadiusZ: tier.startRadiusZ,
          baseHeight: tier.baseHeight,
          rowCount: tier.rowCount,
          rowDepth: tier.rowDepth,
          rowHeight: tier.rowHeight,
          angularSegments: 2,
        });
      }),
    [aisleAngle, sectionAngle, tier],
  );

  useEffect(
    () => () => {
      geometries.forEach((geometry) => geometry.dispose());
      material.dispose();
    },
    [geometries, material],
  );

  return (
    <group name={`${tier.id}-aisles`} dispose={null}>
      {geometries.map((geometry, index) => (
        <mesh key={index} geometry={geometry} material={material} />
      ))}
    </group>
  );
}
