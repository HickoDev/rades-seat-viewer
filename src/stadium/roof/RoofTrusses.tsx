import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  CylinderGeometry,
  MeshStandardMaterial,
  Vector3,
  type InstancedMesh,
} from 'three';

import { createCylinderBetweenMatrix } from '../../utils/geometry';
import { radesStadiumConfig } from '../config/radesStadiumConfig';

export function RoofTrusses() {
  const meshRef = useRef<InstancedMesh>(null);
  const { roof, structure } = radesStadiumConfig;
  const geometry = useMemo(() => new CylinderGeometry(1, 1, 1, 8), []);
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#46544e',
        metalness: 0.55,
        roughness: 0.48,
      }),
    [],
  );
  const matrices = useMemo(
    () =>
      Array.from({ length: structure.frameCount }, (_, frameIndex) => {
        const angle = (frameIndex / structure.frameCount) * Math.PI * 2;
        return createCylinderBetweenMatrix(
          new Vector3(
            Math.cos(angle) * roof.innerRadiusX,
            roof.innerHeight - roof.panelThickness,
            Math.sin(angle) * roof.innerRadiusZ,
          ),
          new Vector3(
            Math.cos(angle) * roof.outerRadiusX,
            roof.outerHeight - roof.panelThickness,
            Math.sin(angle) * roof.outerRadiusZ,
          ),
          roof.trussRadius,
        );
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
      args={[geometry, material, structure.frameCount]}
      name="roof-trusses"
      userData={{ shadowOccluder: true, occluderType: 'roof-truss' }}
    />
  );
}
