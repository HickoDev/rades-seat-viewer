import { useEffect, useMemo } from 'react';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { createAccessRampPlacements } from './createAccessRampPlacements';
import {
  createSpiralGuardGeometry,
  createSpiralRampGeometry,
} from './createSpiralRampGeometry';

export function AccessRamps() {
  const { structure, tiers } = radesStadiumConfig;
  const targetHeight =
    tiers[0].baseHeight + tiers[0].rowCount * tiers[0].rowHeight;
  const rampGeometry = useMemo(
    () =>
      createSpiralRampGeometry({
        outerRadius: structure.rampTowerRadius,
        width: structure.rampWidth,
        height: targetHeight,
        turns: structure.rampTurns,
      }),
    [structure, targetHeight],
  );
  const guardGeometry = useMemo(() => {
    const geometry = createSpiralGuardGeometry({
      outerRadius: structure.rampTowerRadius + 0.04,
      height: targetHeight,
      turns: structure.rampTurns,
      guardHeight: structure.rampGuardHeight,
    });
    return geometry;
  }, [structure, targetHeight]);
  const placements = useMemo(
    () =>
      createAccessRampPlacements({
        centerXs: structure.rampTowerCenterXs,
        centerZ: structure.rampTowerCenterZ,
        count: structure.rampCount,
        entranceSide: radesStadiumConfig.exterior.mainEntranceSide,
      }),
    [
      structure.rampTowerCenterXs,
      structure.rampCount,
      structure.rampTowerCenterZ,
    ],
  );

  useEffect(
    () => () => {
      rampGeometry.dispose();
      guardGeometry.dispose();
    },
    [guardGeometry, rampGeometry],
  );

  return (
    <group
      name="four-circular-access-ramp-towers"
      userData={{ dimensionsAreEstimates: true }}
    >
      {placements.map(({ x, z }, towerIndex) => {
        const rotationY = Math.atan2(-x, -z);
        return (
          <group
            key={`${x}:${z}`}
            name={`spiral-ramp-tower-${towerIndex + 1}`}
            position={[x, 0.38, z]}
            rotation={[0, rotationY, 0]}
          >
            <mesh
              geometry={rampGeometry}
              receiveShadow
              userData={{
                shadowOccluder: true,
                occluderType: 'access-ramp',
              }}
            >
              <meshStandardMaterial color="#b9b7ae" roughness={0.94} />
            </mesh>
            <mesh geometry={guardGeometry}>
              <meshStandardMaterial
                color="#e2dfd2"
                metalness={0.05}
                roughness={0.86}
                side={2}
              />
            </mesh>
            <mesh position={[0, targetHeight / 2, 0]}>
              <cylinderGeometry args={[2.45, 2.7, targetHeight, 24]} />
              <meshStandardMaterial color="#d2d2ca" roughness={0.9} />
            </mesh>
            {Array.from({ length: 4 }, (_, levelIndex) => (
              <mesh
                key={levelIndex}
                position={[0, ((levelIndex + 1) * targetHeight) / 4, 0]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <torusGeometry
                  args={[structure.rampTowerRadius - 0.42, 0.25, 6, 48]}
                />
                <meshStandardMaterial color="#eeeadd" roughness={0.82} />
              </mesh>
            ))}
            <mesh
              position={[
                0,
                targetHeight - 0.18,
                structure.rampTowerRadius + 4.4,
              ]}
            >
              <boxGeometry args={[structure.rampWidth, 0.42, 8.8]} />
              <meshStandardMaterial color="#b4b4ac" roughness={0.92} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
