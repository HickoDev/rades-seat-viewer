import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  CylinderGeometry,
  MeshStandardMaterial,
  type InstancedMesh,
} from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { createRoofTrussMatrices } from './createRoofTrussMatrices';

export function RoofTrusses() {
  const meshRef = useRef<InstancedMesh>(null);
  const { roof, structure } = radesStadiumConfig;
  const geometry = useMemo(() => new CylinderGeometry(1, 1, 1, 8), []);
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#f0f1ec',
        metalness: 0.42,
        roughness: 0.4,
      }),
    [],
  );
  const matrices = useMemo(
    () =>
      createRoofTrussMatrices({
        frameCount: structure.frameCount,
        innerRadiusX: roof.innerRadiusX,
        innerRadiusZ: roof.innerRadiusZ,
        outerRadiusX: roof.outerRadiusX,
        outerRadiusZ: roof.outerRadiusZ,
        innerHeight: roof.innerHeight,
        outerHeight: roof.outerHeight,
        panelThickness: roof.panelThickness,
        innerTrussDepth: roof.innerTrussDepth,
        trussRadius: roof.trussRadius,
      }),
    [roof, structure.frameCount],
  );

  useLayoutEffect(() => {
    if (!meshRef.current) return;
    matrices.forEach((matrix, index) =>
      meshRef.current?.setMatrixAt(index, matrix),
    );
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.computeBoundingSphere();
  }, [matrices]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  return (
    <instancedMesh
      ref={meshRef}
      castShadow
      args={[geometry, material, matrices.length]}
      name="roof-trusses"
      userData={{ shadowOccluder: true, occluderType: 'roof-truss' }}
    />
  );
}
