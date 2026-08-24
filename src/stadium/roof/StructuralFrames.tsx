import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  CylinderGeometry,
  MeshStandardMaterial,
  Vector3,
  type InstancedMesh,
} from 'three';

import { createCylinderBetweenMatrix } from '../../utils/geometry';
import { radesStadiumConfig } from '../config/radesStadiumConfig';

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
        return createCylinderBetweenMatrix(
          new Vector3(
            Math.cos(angle) *
              (roof.outerRadiusX + structure.exteriorRadiusOffset),
            structure.facadeHeight * 0.12,
            Math.sin(angle) *
              (roof.outerRadiusZ + structure.exteriorRadiusOffset),
          ),
          new Vector3(
            Math.cos(angle) * roof.outerRadiusX,
            structure.portalFrameHeight,
            Math.sin(angle) * roof.outerRadiusZ,
          ),
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
    <group name="structural-frames">
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, structure.frameCount]}
        userData={{ shadowOccluder: true, occluderType: 'structural-frame' }}
      />
      {([-1, 1] as const).map((side) => (
        <mesh
          key={side}
          name={`scoreboard-${side}`}
          position={[
            side * (roof.innerRadiusX - structure.scoreboardDepth),
            roof.innerHeight - structure.scoreboardHeight,
            0,
          ]}
          rotation={[0, side === -1 ? Math.PI / 2 : -Math.PI / 2, 0]}
          userData={{ shadowOccluder: true, occluderType: 'scoreboard' }}
        >
          <boxGeometry
            args={[
              structure.scoreboardWidth,
              structure.scoreboardHeight,
              structure.scoreboardDepth,
            ]}
          />
          <meshStandardMaterial color="#101b18" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}
