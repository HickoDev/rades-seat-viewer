import { useEffect, useMemo } from 'react';
import { MeshStandardMaterial } from 'three';

import type { StadiumConfig } from '../types/stadium.types';
import { getStadiumPerimeterAngleForDistance } from '../geometry/stadiumPerimeter';
import { createTierGeometry } from './createTierGeometry';
import { getTierAisleWidth, getTierMajorCutout } from './tierAccess';

type TierConfig = StadiumConfig['tiers'][number];

export function Aisles({ tier }: { tier: TierConfig }) {
  const sectionAngle = (Math.PI * 2) / tier.sectionCount;
  const material = useMemo(
    () => new MeshStandardMaterial({ color: '#aeb7b1', roughness: 0.96 }),
    [],
  );
  const geometries = useMemo(
    () =>
      Array.from({ length: tier.sectionCount }, (_, sectionIndex) => {
        if (getTierMajorCutout(tier, sectionIndex)) return null;
        const boundary = sectionIndex * sectionAngle;
        const aisleAngle = getStadiumPerimeterAngleForDistance(
          getTierAisleWidth(tier, sectionIndex),
          tier.startRadiusX,
          tier.startRadiusZ,
        );
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
      }).filter((geometry) => geometry !== null),
    [sectionAngle, tier],
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
