import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  CylinderGeometry,
  DoubleSide,
  MeshStandardMaterial,
  type InstancedMesh,
} from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { createRoofMembraneSeamMatrices } from './createRoofMembraneSeamMatrices';

export function RoofMembraneDetails() {
  const seamRef = useRef<InstancedMesh>(null);
  const { roof } = radesStadiumConfig;
  const geometry = useMemo(() => new CylinderGeometry(1, 1, 1, 7), []);
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#f7f4ec',
        metalness: 0.08,
        roughness: 0.7,
      }),
    [],
  );
  const matrices = useMemo(
    () =>
      createRoofMembraneSeamMatrices({
        seamCount: roof.membraneBayCount,
        innerRadiusX: roof.innerRadiusX,
        innerRadiusZ: roof.innerRadiusZ,
        outerRadiusX: roof.outerRadiusX,
        outerRadiusZ: roof.outerRadiusZ,
        innerHeight: roof.innerHeight,
        outerHeight: roof.outerHeight,
        outerWaveHeight: roof.outerWaveHeight,
        outerWaveRadius: roof.outerWaveRadius,
        radius: roof.membraneSeamRadius,
      }),
    [roof],
  );

  useLayoutEffect(() => {
    const mesh = seamRef.current;
    if (!mesh) return;
    matrices.forEach((matrix, instanceId) =>
      mesh.setMatrixAt(instanceId, matrix),
    );
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [matrices]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  return (
    <group name="tensile-membrane-seams-and-inner-fascia">
      <instancedMesh
        ref={seamRef}
        args={[geometry, material, matrices.length]}
        name="roof-membrane-radial-seams"
      />
      <mesh
        position={[0, roof.innerHeight - roof.innerFasciaHeight / 2, 0]}
        scale={[
          roof.innerRadiusX + 0.18,
          roof.innerFasciaHeight,
          roof.innerRadiusZ + 0.18,
        ]}
      >
        <cylinderGeometry
          args={[1, 1, 1, roof.membraneBayCount * 4, 1, true]}
        />
        <meshStandardMaterial
          color="#f0f1ed"
          metalness={0.2}
          roughness={0.5}
          side={DoubleSide}
        />
      </mesh>
    </group>
  );
}
