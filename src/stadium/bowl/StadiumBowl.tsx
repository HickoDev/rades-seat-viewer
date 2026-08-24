import { useEffect, useMemo } from 'react';
import { DoubleSide } from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { Aisles } from './Aisles';
import { ConcourseRing } from './ConcourseRing';
import { createEllipticalRingGeometry } from './createTierGeometry';
import { SectionBarriers } from './SectionBarriers';
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
  const lowerTier = radesStadiumConfig.tiers.find(
    (tier) => tier.id === 'lower',
  );
  const upperSlabOccluder = useMemo(() => {
    if (!upperTier) return null;
    const geometry = createEllipticalRingGeometry({
      innerRadiusX: upperTier.startRadiusX,
      innerRadiusZ: upperTier.startRadiusZ,
      outerRadiusX:
        upperTier.startRadiusX + upperTier.rowCount * upperTier.rowDepth,
      outerRadiusZ:
        upperTier.startRadiusZ + upperTier.rowCount * upperTier.rowDepth,
      height: upperTier.baseHeight,
    });
    geometry.computeBoundsTree();
    return geometry;
  }, [upperTier]);

  useEffect(
    () => () => {
      walkwayGeometries.forEach((geometry) => geometry.dispose());
      upperSlabOccluder?.disposeBoundsTree();
      upperSlabOccluder?.dispose();
    },
    [upperSlabOccluder, walkwayGeometries],
  );

  return (
    <group name="stadium-bowl">
      {lowerTier && upperTier && (
        <ConcourseRing
          details={radesStadiumConfig.bowlDetails}
          lowerTier={lowerTier}
          upperTier={upperTier}
        />
      )}
      {lowerTier && (
        <mesh
          name="lower-tier-front-wall"
          position={[0, (lowerTier.baseHeight + lowerTier.rowHeight) / 2, 0]}
          scale={[
            lowerTier.startRadiusX,
            lowerTier.baseHeight + lowerTier.rowHeight,
            lowerTier.startRadiusZ,
          ]}
          userData={{
            shadowOccluder: true,
            occluderType: 'lower-tier-front-wall',
          }}
        >
          <cylinderGeometry args={[1, 1, 1, 192, 1, true]} />
          <meshStandardMaterial
            color="#929c96"
            roughness={0.97}
            side={DoubleSide}
          />
        </mesh>
      )}
      {radesStadiumConfig.tiers.map((tier, tierIndex) => {
        const outerRadiusX = tier.startRadiusX + tier.rowCount * tier.rowDepth;
        const outerRadiusZ = tier.startRadiusZ + tier.rowCount * tier.rowDepth;
        const tierHeight = tier.baseHeight + tier.rowCount * tier.rowHeight;

        return (
          <group key={tier.id}>
            <StadiumTier tier={tier} />
            <Aisles tier={tier} />
            <SectionBarriers
              barrier={radesStadiumConfig.bowlDetails}
              tier={tier}
            />
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
              <meshStandardMaterial color="#707a74" roughness={0.98} side={2} />
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
          <meshBasicMaterial
            colorWrite={false}
            depthWrite={false}
            side={DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
