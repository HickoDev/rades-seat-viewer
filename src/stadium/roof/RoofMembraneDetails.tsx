import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  CylinderGeometry,
  MeshStandardMaterial,
  type InstancedMesh,
} from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { createStadiumPerimeterWallGeometry } from '../geometry/createStadiumPerimeterWallGeometry';
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
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
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
  const fasciaGeometry = useMemo(
    () =>
      createStadiumPerimeterWallGeometry({
        bottom: roof.innerHeight - roof.innerFasciaHeight,
        extentX: roof.innerRadiusX + 0.18,
        extentZ: roof.innerRadiusZ + 0.18,
        height: roof.innerFasciaHeight,
        segments: roof.membraneBayCount * 4,
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
      fasciaGeometry.dispose();
      material.dispose();
    },
    [fasciaGeometry, geometry, material],
  );

  return (
    <group name="tensile-membrane-seams-and-inner-fascia">
      <instancedMesh
        ref={seamRef}
        args={[geometry, material, matrices.length]}
        name="roof-membrane-radial-seams"
      />
      <mesh geometry={fasciaGeometry}>
        <meshStandardMaterial
          color="#f0f1ed"
          metalness={0.2}
          roughness={0.5}
          side={2}
        />
      </mesh>
    </group>
  );
}
