import { useEffect, useMemo } from 'react';
import { DoubleSide, MeshStandardMaterial } from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { createRoofGeometry } from './createRoofGeometry';

export function StadiumRoof() {
  const roof = radesStadiumConfig.roof;
  const geometry = useMemo(
    () =>
      createRoofGeometry({
        innerRadiusX: roof.innerRadiusX,
        innerRadiusZ: roof.innerRadiusZ,
        outerRadiusX: roof.outerRadiusX,
        outerRadiusZ: roof.outerRadiusZ,
        innerHeight: roof.innerHeight,
        outerHeight: roof.outerHeight,
        thickness: roof.panelThickness,
      }),
    [roof],
  );
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#a8b4ae',
        metalness: 0.34,
        roughness: 0.58,
        side: DoubleSide,
      }),
    [],
  );

  useEffect(
    () => () => {
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
