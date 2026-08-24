import { useLayoutEffect, useMemo, useRef } from 'react';
import { Object3D, type InstancedMesh } from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';

export function ExteriorMosaicBand() {
  const meshRef = useRef<InstancedMesh>(null);
  const { roof, structure } = radesStadiumConfig;
  const radiusX = roof.outerRadiusX + structure.exteriorRadiusOffset * 0.74;
  const radiusZ = roof.outerRadiusZ + structure.exteriorRadiusOffset * 0.74;
  const matrices = useMemo(() => {
    const marker = new Object3D();
    return Array.from(
      { length: structure.exteriorPatternCount },
      (_, patternIndex) => {
        const angle =
          (patternIndex / structure.exteriorPatternCount) * Math.PI * 2;
        marker.position.set(
          Math.cos(angle) * (radiusX + 0.12),
          structure.exteriorBandBottomHeight +
            structure.exteriorBandHeight * 0.54,
          Math.sin(angle) * (radiusZ + 0.12),
        );
        marker.lookAt(0, marker.position.y, 0);
        marker.rotateZ(Math.PI / 4);
        marker.scale.set(2.15, 0.72, 0.14);
        marker.updateMatrix();
        return marker.matrix.clone();
      },
    );
  }, [radiusX, radiusZ, structure]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    matrices.forEach((matrix, instanceId) =>
      mesh.setMatrixAt(instanceId, matrix),
    );
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [matrices]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, matrices.length]}
      name="blue-diamond-exterior-frieze"
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#287aa8" roughness={0.62} />
    </instancedMesh>
  );
}
