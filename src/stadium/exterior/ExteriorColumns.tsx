import { useLayoutEffect, useMemo, useRef } from 'react';
import { Matrix4, Quaternion, Vector3, type InstancedMesh } from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';

export function ExteriorColumns() {
  const meshRef = useRef<InstancedMesh>(null);
  const { roof, structure } = radesStadiumConfig;
  const matrices = useMemo(
    () =>
      Array.from({ length: structure.frameCount }, (_, columnIndex) => {
        const angle = (columnIndex / structure.frameCount) * Math.PI * 2;
        return new Matrix4().compose(
          new Vector3(
            Math.cos(angle) *
              (roof.outerRadiusX + structure.exteriorRadiusOffset),
            structure.facadeHeight / 2,
            Math.sin(angle) *
              (roof.outerRadiusZ + structure.exteriorRadiusOffset),
          ),
          new Quaternion(),
          new Vector3(
            structure.columnRadius,
            structure.facadeHeight,
            structure.columnRadius,
          ),
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

  return (
    <instancedMesh
      ref={meshRef}
      castShadow
      args={[undefined, undefined, structure.frameCount]}
      name="exterior-columns"
      userData={{ shadowOccluder: true, occluderType: 'major-column' }}
    >
      <cylinderGeometry args={[1, 1, 1, 10]} />
      <meshStandardMaterial color="#d3d5cd" roughness={0.82} />
    </instancedMesh>
  );
}
