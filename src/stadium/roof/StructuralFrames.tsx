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
        <group
          key={side}
          name={`scoreboard-${side}`}
          position={[
            side * (roof.innerRadiusX - structure.scoreboardDepth),
            roof.innerHeight - structure.scoreboardHeight,
            0,
          ]}
          rotation={[0, side === -1 ? Math.PI / 2 : -Math.PI / 2, 0]}
        >
          <mesh userData={{ shadowOccluder: true, occluderType: 'scoreboard' }}>
            <boxGeometry
              args={[
                structure.scoreboardWidth + 0.8,
                structure.scoreboardHeight + 0.8,
                structure.scoreboardDepth,
              ]}
            />
            <meshStandardMaterial
              color="#d7d8ce"
              metalness={0.34}
              roughness={0.58}
            />
          </mesh>
          <mesh position={[0, 0, structure.scoreboardDepth / 2 + 0.025]}>
            <boxGeometry
              args={[
                structure.scoreboardWidth,
                structure.scoreboardHeight,
                0.05,
              ]}
            />
            <meshStandardMaterial
              color="#101313"
              emissive="#16252a"
              emissiveIntensity={0.16}
              roughness={0.34}
            />
          </mesh>
          <mesh
            position={[
              0,
              -(
                structure.scoreboardHeight + structure.scoreboardFlagPanelHeight
              ) /
                2 -
                0.45,
              0,
            ]}
          >
            <boxGeometry
              args={[
                structure.scoreboardWidth * 0.58,
                structure.scoreboardFlagPanelHeight,
                structure.scoreboardDepth * 0.42,
              ]}
            />
            <meshStandardMaterial color="#bd1e2d" roughness={0.8} />
          </mesh>
          <mesh
            position={[
              0,
              -(
                structure.scoreboardHeight + structure.scoreboardFlagPanelHeight
              ) /
                2 -
                0.45,
              structure.scoreboardDepth * 0.23,
            ]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry
              args={[
                structure.scoreboardFlagPanelHeight * 0.23,
                structure.scoreboardFlagPanelHeight * 0.23,
                0.055,
                32,
              ]}
            />
            <meshStandardMaterial color="#f4eee2" roughness={0.76} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
