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
    });
    roofGeometry.computeBoundsTree();
    return roofGeometry;
  }, [roof]);
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#ddd4bd',
        metalness: 0.02,
        roughness: 0.84,
        side: DoubleSide,
      }),
    [],
  );

  useEffect(
    () => () => {
      geometry.disposeBoundsTree();
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  return (
    <mesh
      geometry={geometry}
      material={material}
      name="roof-occluder"
      userData={{ shadowOccluder: true, occluderType: 'roof' }}
    />
  );
}
