import { useMemo } from 'react';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { Aisles } from './Aisles';
import { createEllipticalRingGeometry } from './createTierGeometry';
import { StadiumTier } from './StadiumTier';
import { Vomitories } from './Vomitories';

export function StadiumBowl() {
  const walkwayGeometries = useMemo(
    () =>
      radesStadiumConfig.tiers.map((tier) => {
        const outerRadiusX = tier.startRadiusX + tier.rowCount * tier.rowDepth;
        const outerRadiusZ = tier.startRadiusZ + tier.rowCount * tier.rowDepth;
        return createEllipticalRingGeometry({
          innerRadiusX: outerRadiusX,
          innerRadiusZ: outerRadiusZ,
          outerRadiusX: outerRadiusX + tier.walkwayWidth,
          outerRadiusZ: outerRadiusZ + tier.walkwayWidth,
          height: tier.baseHeight + tier.rowCount * tier.rowHeight,
        });
      }),
    [],
  );
  const upperTier = radesStadiumConfig.tiers.find(
    (tier) => tier.id === 'upper',
  );
  const upperSlabOccluder = useMemo(() => {
    if (!upperTier) return null;
    return createEllipticalRingGeometry({
      innerRadiusX: upperTier.startRadiusX,
      innerRadiusZ: upperTier.startRadiusZ,
      outerRadiusX:
        upperTier.startRadiusX + upperTier.rowCount * upperTier.rowDepth,
      outerRadiusZ:
        upperTier.startRadiusZ + upperTier.rowCount * upperTier.rowDepth,
      height: upperTier.baseHeight,
    });
  }, [upperTier]);

  return (
    <group name="stadium-bowl">
      {radesStadiumConfig.tiers.map((tier, tierIndex) => {
        const outerRadiusX = tier.startRadiusX + tier.rowCount * tier.rowDepth;
        const outerRadiusZ = tier.startRadiusZ + tier.rowCount * tier.rowDepth;
        const tierHeight = tier.baseHeight + tier.rowCount * tier.rowHeight;

        return (
          <group key={tier.id}>
            <StadiumTier tier={tier} />
            <Aisles tier={tier} />
            <Vomitories tier={tier} />
            <mesh geometry={walkwayGeometries[tierIndex]}>
              <meshStandardMaterial color="#7f8b85" roughness={0.96} />
            </mesh>
            <mesh
              position={[0, tierHeight / 2, 0]}
              scale={[
                outerRadiusX + tier.walkwayWidth,
                tierHeight,
                outerRadiusZ + tier.walkwayWidth,
              ]}
              userData={{
                shadowOccluder: true,
                occluderType: 'large-structural-wall',
              }}
            >
              <cylinderGeometry args={[1, 1, 1, 192, 1, true]} />
              <meshStandardMaterial color="#414d47" roughness={0.98} side={2} />
            </mesh>
          </group>
        );
      })}
      {upperSlabOccluder && (
        <mesh
          geometry={upperSlabOccluder}
          name="upper-tier-shadow-proxy"
          userData={{
            shadowOccluder: true,
            occluderType: 'upper-tier-slab',
          }}
        >
          <meshBasicMaterial colorWrite={false} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
