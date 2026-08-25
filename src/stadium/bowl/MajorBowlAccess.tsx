import { useEffect, useMemo } from 'react';
import { DoubleSide } from 'three';

import { getStadiumPerimeterFrame } from '../geometry/stadiumPerimeter';
import type { StadiumConfig } from '../types/stadium.types';
import { createMajorBowlAccessGeometry } from './createMajorBowlAccessGeometry';

type TierConfig = StadiumConfig['tiers'][number];

export function MajorBowlAccess({ tier }: { tier: TierConfig }) {
  const routes = useMemo(
    () =>
      tier.majorCutouts.map((cutout) => ({
        cutout,
        geometries: createMajorBowlAccessGeometry(tier, cutout),
      })),
    [tier],
  );

  useEffect(
    () => () => {
      routes.forEach(({ geometries }) =>
        Object.values(geometries).forEach((geometry) => geometry.dispose()),
      );
    },
    [routes],
  );

  return (
    <group name={`${tier.id}-major-virage-access-corridors`}>
      {routes.map(({ cutout, geometries }) => {
        const centerAngle =
          (cutout.boundaryIndex / tier.sectionCount) * Math.PI * 2;
        const extentX =
          tier.startRadiusX + tier.rowCount * tier.rowDepth + 0.35;
        const extentZ =
          tier.startRadiusZ + tier.rowCount * tier.rowDepth + 0.35;
        const portal = getStadiumPerimeterFrame(centerAngle, extentX, extentZ);
        const rotationY = -Math.atan2(portal.tangentZ, portal.tangentX);
        const portalHeight = 3.35;
        const portalY =
          tier.baseHeight + tier.rowCount * tier.rowHeight + portalHeight / 2;

        return (
          <group
            key={cutout.id}
            name={cutout.id}
            userData={{ circulationRole: 'major-virage-separation' }}
          >
            <mesh geometry={geometries.shoulders} receiveShadow>
              <meshStandardMaterial
                color="#b7b5aa"
                roughness={0.98}
                side={DoubleSide}
              />
            </mesh>
            <mesh geometry={geometries.floor} receiveShadow>
              <meshStandardMaterial
                color="#555b59"
                roughness={0.94}
                side={DoubleSide}
              />
            </mesh>
            <mesh geometry={geometries.stepMarkings}>
              <meshStandardMaterial
                color="#d8d8ce"
                roughness={0.82}
                side={DoubleSide}
              />
            </mesh>
            <mesh
              geometry={geometries.walls}
              receiveShadow
              userData={{
                shadowOccluder: true,
                occluderType: 'large-structural-wall',
              }}
            >
              <meshStandardMaterial
                color="#deded5"
                roughness={0.96}
                side={DoubleSide}
              />
            </mesh>

            <group
              position={[portal.x, portalY, portal.z]}
              rotation={[0, rotationY, 0]}
            >
              <mesh position={[0, 0, 0.08]}>
                <boxGeometry args={[cutout.accessWidth, portalHeight, 0.26]} />
                <meshStandardMaterial
                  color="#323b3c"
                  emissive="#182427"
                  emissiveIntensity={0.18}
                  roughness={0.88}
                />
              </mesh>
              {([-1, 1] as const).map((side) => (
                <mesh
                  key={side}
                  position={[side * (cutout.accessWidth / 2 + 0.25), 0, 0]}
                >
                  <boxGeometry args={[0.5, portalHeight + 0.5, 0.58]} />
                  <meshStandardMaterial color="#ecebe2" roughness={0.94} />
                </mesh>
              ))}
              <mesh position={[0, portalHeight / 2 + 0.25, 0]}>
                <boxGeometry args={[cutout.accessWidth + 1, 0.5, 0.58]} />
                <meshStandardMaterial color="#ecebe2" roughness={0.94} />
              </mesh>
              <mesh position={[0, portalHeight / 2 - 0.3, -0.34]}>
                <boxGeometry args={[cutout.accessWidth * 0.42, 0.24, 0.1]} />
                <meshStandardMaterial
                  color="#235fa5"
                  emissive="#153d73"
                  emissiveIntensity={0.24}
                  roughness={0.58}
                />
              </mesh>
            </group>
          </group>
        );
      })}
    </group>
  );
}
