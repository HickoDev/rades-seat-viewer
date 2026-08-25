import { useEffect, useMemo } from 'react';

import { createEllipticalRingGeometry } from '../bowl/createTierGeometry';
import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { createStadiumSiteBaseGeometry } from './createStadiumSiteBaseGeometry';

export function StadiumSite() {
  const { roof, site, structure, tiers } = radesStadiumConfig;
  const lowerTier = tiers.find((tier) => tier.id === 'lower') ?? tiers[0];
  const promenadeInnerX =
    roof.outerRadiusX + structure.exteriorRadiusOffset + site.promenadeOffset;
  const promenadeInnerZ =
    roof.outerRadiusZ + structure.exteriorRadiusOffset + site.promenadeOffset;
  const promenadeOuterX = promenadeInnerX + site.promenadeWidth;
  const promenadeOuterZ = promenadeInnerZ + site.promenadeWidth;
  const landscapeOuterX = promenadeOuterX + site.landscapeWidth;
  const landscapeOuterZ = promenadeOuterZ + site.landscapeWidth;
  const roadOuterX = landscapeOuterX + site.serviceRoadWidth;
  const roadOuterZ = landscapeOuterZ + site.serviceRoadWidth;

  const geometries = useMemo(
    () => ({
      base: createStadiumSiteBaseGeometry(
        site.baseRadiusX,
        site.baseRadiusZ,
        lowerTier,
      ),
      promenade: createEllipticalRingGeometry({
        innerRadiusX: promenadeInnerX,
        innerRadiusZ: promenadeInnerZ,
        outerRadiusX: promenadeOuterX,
        outerRadiusZ: promenadeOuterZ,
        height: 0.015,
      }),
      landscape: createEllipticalRingGeometry({
        innerRadiusX: promenadeOuterX,
        innerRadiusZ: promenadeOuterZ,
        outerRadiusX: landscapeOuterX,
        outerRadiusZ: landscapeOuterZ,
        height: 0.025,
      }),
      serviceRoad: createEllipticalRingGeometry({
        innerRadiusX: landscapeOuterX,
        innerRadiusZ: landscapeOuterZ,
        outerRadiusX: roadOuterX,
        outerRadiusZ: roadOuterZ,
        height: 0.005,
      }),
    }),
    [
      landscapeOuterX,
      landscapeOuterZ,
      lowerTier,
      promenadeInnerX,
      promenadeInnerZ,
      promenadeOuterX,
      promenadeOuterZ,
      roadOuterX,
      roadOuterZ,
      site.baseRadiusX,
      site.baseRadiusZ,
    ],
  );

  useEffect(
    () => () =>
      Object.values(geometries).forEach((geometry) => geometry.dispose()),
    [geometries],
  );

  return (
    <group
      name="rades-olympic-city-site"
      userData={{ dimensionsAreEstimates: true }}
    >
      <mesh
        geometry={geometries.base}
        position={[0, -0.075, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#bcb49f" roughness={0.99} />
      </mesh>
      <mesh geometry={geometries.promenade} receiveShadow>
        <meshStandardMaterial color="#b96e5c" roughness={0.96} />
      </mesh>
      <mesh geometry={geometries.landscape} receiveShadow>
        <meshStandardMaterial color="#617857" roughness={0.99} />
      </mesh>
      <mesh geometry={geometries.serviceRoad} receiveShadow>
        <meshStandardMaterial color="#59605f" roughness={0.94} />
      </mesh>
    </group>
  );
}
