import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  CylinderGeometry,
  MeshStandardMaterial,
  Vector3,
  type InstancedMesh,
} from 'three';

import { createCylinderBetweenMatrix } from '../../utils/geometry';
import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { getStadiumPerimeterPoint } from '../geometry/stadiumPerimeter';

export function StructuralFrames() {
  const meshRef = useRef<InstancedMesh>(null);
  const { roof, structure } = radesStadiumConfig;
  const geometry = useMemo(() => new CylinderGeometry(1, 1, 1, 8), []);
  const material = useMemo(
    () => new MeshStandardMaterial({ color: '#69766f', roughness: 0.7 }),
    [],
  );
  const matrices = useMemo(
    () =>
      Array.from({ length: structure.frameCount }, (_, frameIndex) => {
        const angle = (frameIndex / structure.frameCount) * Math.PI * 2;
        const base = getStadiumPerimeterPoint(
          angle,
          roof.outerRadiusX + structure.exteriorRadiusOffset,
          roof.outerRadiusZ + structure.exteriorRadiusOffset,
        );
        const top = getStadiumPerimeterPoint(
          angle,
          roof.outerRadiusX,
          roof.outerRadiusZ,
        );
        return createCylinderBetweenMatrix(
          new Vector3(base.x, structure.facadeHeight * 0.12, base.z),
          new Vector3(top.x, structure.portalFrameHeight, top.z),
          structure.columnRadius * 0.52,
        );
      }),
    [roof, structure],
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
      name="structural-frames"
      userData={{ shadowOccluder: true, occluderType: 'structural-frame' }}
    />
  );
}
