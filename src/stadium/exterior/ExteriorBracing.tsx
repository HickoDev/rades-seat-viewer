import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  CylinderGeometry,
  DoubleSide,
  MeshStandardMaterial,
  type InstancedMesh,
} from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { createExteriorBraceMatrices } from './createExteriorBraceMatrices';

export function ExteriorBracing() {
  const braceRef = useRef<InstancedMesh>(null);
  const { roof, structure } = radesStadiumConfig;
  const radiusX = roof.outerRadiusX + structure.exteriorBraceRadiusOffset;
  const radiusZ = roof.outerRadiusZ + structure.exteriorBraceRadiusOffset;
  const galleryHeight =
    structure.exteriorBraceTopHeight - structure.exteriorBraceBottomHeight;
  const braceGeometry = useMemo(() => new CylinderGeometry(1, 1, 1, 8), []);
  const braceMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#d9dedb',
        metalness: 0.34,
        roughness: 0.52,
      }),
    [],
  );
  const matrices = useMemo(
    () =>
      createExteriorBraceMatrices({
        bayCount: structure.exteriorBraceBayCount,
        radiusX,
        radiusZ,
        bottomHeight: structure.exteriorBraceBottomHeight,
        topHeight: structure.exteriorBraceTopHeight,
        radius: structure.columnRadius * 0.34,
      }),
    [radiusX, radiusZ, structure],
  );

  useLayoutEffect(() => {
    const mesh = braceRef.current;
    if (!mesh) return;
    matrices.forEach((matrix, instanceId) =>
      mesh.setMatrixAt(instanceId, matrix),
    );
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [matrices]);

  useEffect(
    () => () => {
      braceGeometry.dispose();
      braceMaterial.dispose();
    },
    [braceGeometry, braceMaterial],
  );

  return (
    <group name="open-upper-facade-with-x-bracing">
      <mesh
        position={[
          0,
          structure.exteriorBraceBottomHeight + galleryHeight / 2,
          0,
        ]}
        scale={[radiusX - 0.45, galleryHeight, radiusZ - 0.45]}
      >
        <cylinderGeometry
          args={[1, 1, 1, structure.exteriorBraceBayCount * 3, 1, true]}
        />
        <meshStandardMaterial
          color="#26302f"
          emissive="#101818"
          emissiveIntensity={0.06}
          roughness={0.88}
          side={DoubleSide}
        />
      </mesh>
      <instancedMesh
        ref={braceRef}
        args={[braceGeometry, braceMaterial, matrices.length]}
        name="exterior-cross-braces"
      />
      {[
        structure.exteriorBraceBottomHeight,
        structure.exteriorBraceTopHeight,
      ].map((height) => (
        <mesh
          key={height}
          position={[0, height, 0]}
          scale={[radiusX + 0.25, 0.34, radiusZ + 0.25]}
        >
          <cylinderGeometry
            args={[1, 1, 1, structure.exteriorBraceBayCount * 3, 1, true]}
          />
          <meshStandardMaterial
            color="#17699d"
            metalness={0.18}
            roughness={0.58}
            side={DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
