import { useEffect, useMemo } from 'react';
import { DoubleSide } from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { createStadiumPerimeterWallGeometry } from '../geometry/createStadiumPerimeterWallGeometry';
import { getStadiumPerimeterAngleForDistance } from '../geometry/stadiumPerimeter';
import { Aisles } from './Aisles';
import { ConcourseRing } from './ConcourseRing';
import { createEllipticalRingGeometry } from './createTierGeometry';
import { HonorPressTribune } from './HonorPressTribune';
import { SectionBarriers } from './SectionBarriers';
import { StadiumTier } from './StadiumTier';
import { Vomitories } from './Vomitories';

function getMajorCutoutGaps(
  tier: (typeof radesStadiumConfig.tiers)[number],
  extentX: number,
  extentZ: number,
) {
  return tier.majorCutouts.map((cutout) => ({
    centerAngle: (cutout.boundaryIndex / tier.sectionCount) * Math.PI * 2,
    angularWidth: getStadiumPerimeterAngleForDistance(
      cutout.width,
      extentX,
      extentZ,
    ),
  }));
}

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
          gaps: getMajorCutoutGaps(tier, outerRadiusX, outerRadiusZ),
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
  const playerTunnelGapAngle = lowerTier
    ? getStadiumPerimeterAngleForDistance(
        radesStadiumConfig.grandstand.playerTunnelWidth + 0.6,
        lowerTier.startRadiusX,
        lowerTier.startRadiusZ,
      )
    : 0;
  const lowerFrontWallGeometry = useMemo(() => {
    if (!lowerTier) return null;
    return createStadiumPerimeterWallGeometry({
      bottom: 0,
      extentX: lowerTier.startRadiusX,
      extentZ: lowerTier.startRadiusZ,
      gapAngle: playerTunnelGapAngle,
      gapCenterAngle:
        radesStadiumConfig.grandstand.side === 1 ? Math.PI / 2 : -Math.PI / 2,
      height: lowerTier.baseHeight + lowerTier.rowHeight,
    });
  }, [lowerTier, playerTunnelGapAngle]);
  const structuralWallGeometries = useMemo(
    () =>
      radesStadiumConfig.tiers.map((tier) => {
        const extentX = tier.startRadiusX + tier.rowCount * tier.rowDepth;
        const extentZ = tier.startRadiusZ + tier.rowCount * tier.rowDepth;
        return createStadiumPerimeterWallGeometry({
          bottom: 0,
          extentX: extentX + tier.walkwayWidth,
          extentZ: extentZ + tier.walkwayWidth,
          height: tier.baseHeight + tier.rowCount * tier.rowHeight,
          gaps: getMajorCutoutGaps(tier, extentX, extentZ),
        });
      }),
    [],
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
      structuralWallGeometries.forEach((geometry) => geometry.dispose());
      lowerFrontWallGeometry?.dispose();
      upperSlabOccluder?.disposeBoundsTree();
      upperSlabOccluder?.dispose();
    },
    [
      lowerFrontWallGeometry,
      structuralWallGeometries,
      upperSlabOccluder,
      walkwayGeometries,
    ],
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
      <HonorPressTribune />
      {lowerTier && (
        <mesh
          geometry={lowerFrontWallGeometry ?? undefined}
          name="lower-tier-front-wall"
          userData={{
            shadowOccluder: true,
            occluderType: 'lower-tier-front-wall',
          }}
        >
          <meshStandardMaterial
            color="#929c96"
            roughness={0.97}
            side={DoubleSide}
          />
        </mesh>
      )}
      {radesStadiumConfig.tiers.map((tier, tierIndex) => {
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
              geometry={structuralWallGeometries[tierIndex]}
              userData={{
                shadowOccluder: true,
                occluderType: 'large-structural-wall',
              }}
            >
              <meshStandardMaterial
                color="#c9c5b8"
                emissive="#494840"
                emissiveIntensity={0.08}
                roughness={0.96}
                side={2}
              />
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
