import { useLayoutEffect, useMemo, useRef } from 'react';
import { Object3D, Vector3, type InstancedMesh } from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';

export function AccessRamps() {
  const meshRef = useRef<InstancedMesh>(null);
  const { roof, structure, tiers } = radesStadiumConfig;
  const lowerConcourseHeight =
    tiers[0].baseHeight + tiers[0].rowCount * tiers[0].rowHeight;
  const matrices = useMemo(
    () =>
      Array.from({ length: structure.rampCount }, (_, rampIndex) => {
        const angle = (rampIndex / structure.rampCount) * Math.PI * 2;
        const outward = new Vector3(Math.cos(angle), 0, Math.sin(angle));
        const end = new Vector3(
          Math.cos(angle) *
            (roof.outerRadiusX + structure.exteriorRadiusOffset),
          lowerConcourseHeight,
          Math.sin(angle) *
            (roof.outerRadiusZ + structure.exteriorRadiusOffset),
        );
        const start = end
          .clone()
          .addScaledVector(outward, structure.rampRun)
          .setY(0.4);
        const midpoint = start.clone().add(end).multiplyScalar(0.5);
        const object = new Object3D();
        object.position.copy(midpoint);
        object.lookAt(end);
        object.scale.set(structure.rampWidth, 0.45, start.distanceTo(end));
        object.updateMatrix();
        return object.matrix.clone();
      }),
    [lowerConcourseHeight, roof, structure],
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
      args={[undefined, undefined, structure.rampCount]}
      name="major-access-ramps"
      userData={{ shadowOccluder: true, occluderType: 'access-ramp' }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#66736c" roughness={0.96} />
    </instancedMesh>
  );
}
