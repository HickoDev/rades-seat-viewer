import { useEffect, useMemo } from 'react';
import { DoubleSide, MeshStandardMaterial } from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { createRoofGeometry } from './createRoofGeometry';

export function StadiumRoof() {
  const roof = radesStadiumConfig.roof;
  const geometry = useMemo(() => {
    const roofGeometry = createRoofGeometry({
      innerRadiusX: roof.innerRadiusX,
      innerRadiusZ: roof.innerRadiusZ,
      outerRadiusX: roof.outerRadiusX,
      outerRadiusZ: roof.outerRadiusZ,
      innerHeight: roof.innerHeight,
      outerHeight: roof.outerHeight,
      thickness: roof.panelThickness,
      waveCount: roof.membraneBayCount,
      outerWaveHeight: roof.outerWaveHeight,
      outerWaveRadius: roof.outerWaveRadius,
      innerWaveHeight: roof.innerWaveHeight,
      membraneSag: roof.membraneSag,
    });
    roofGeometry.computeBoundsTree();
    return roofGeometry;
  }, [roof]);
  const materials = useMemo(
    () => ({
      top: new MeshStandardMaterial({
        color: '#f1eee4',
        metalness: 0.02,
        roughness: 0.68,
        side: DoubleSide,
      }),
      underside: new MeshStandardMaterial({
        color: '#c8c18f',
        metalness: 0.06,
        roughness: 0.86,
        side: DoubleSide,
      }),
      edge: new MeshStandardMaterial({
        color: '#e5e3da',
        metalness: 0.05,
        roughness: 0.72,
        side: DoubleSide,
      }),
    }),
    [],
  );

  useEffect(
    () => () => {
      geometry.disposeBoundsTree();
      geometry.dispose();
      Object.values(materials).forEach((material) => material.dispose());
    },
    [geometry, materials],
  );

  return (
    <mesh
      castShadow
      geometry={geometry}
      material={[materials.top, materials.underside, materials.edge]}
      name="roof-occluder"
      userData={{ shadowOccluder: true, occluderType: 'roof' }}
    />
  );
}
