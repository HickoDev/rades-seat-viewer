import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { BoxGeometry, MeshStandardMaterial, type InstancedMesh } from 'three';

import type { StadiumConfig } from '../types/stadium.types';
import { createVomitoryFeatureMatrices } from './createVomitoryFeatureMatrices';

type TierConfig = StadiumConfig['tiers'][number];

export function Vomitories({ tier }: { tier: TierConfig }) {
  const ceilingRef = useRef<InstancedMesh>(null);
  const floorRef = useRef<InstancedMesh>(null);
  const frameRef = useRef<InstancedMesh>(null);
  const lightRef = useRef<InstancedMesh>(null);
  const signRef = useRef<InstancedMesh>(null);
  const wallRef = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const features = useMemo(() => createVomitoryFeatureMatrices(tier), [tier]);
  const materials = useMemo(
    () => ({
      concrete: new MeshStandardMaterial({
        color: '#d7d8d1',
        roughness: 0.97,
      }),
      floor: new MeshStandardMaterial({
        color: '#737d78',
        roughness: 0.96,
      }),
      frame: new MeshStandardMaterial({
        color: '#b8c0ba',
        roughness: 0.93,
      }),
      light: new MeshStandardMaterial({
        color: '#f4f0d5',
        emissive: '#fff3b4',
        emissiveIntensity: 1.7,
        roughness: 0.42,
      }),
      sign: new MeshStandardMaterial({
        color: '#74dea2',
        emissive: '#43d58b',
        emissiveIntensity: 0.72,
        roughness: 0.5,
      }),
    }),
    [],
  );

  useLayoutEffect(() => {
    const groups = [
      [ceilingRef.current, features.ceilings],
      [floorRef.current, features.floors],
      [frameRef.current, features.frames],
      [lightRef.current, features.lights],
      [signRef.current, features.signs],
      [wallRef.current, features.walls],
    ] as const;

    groups.forEach(([mesh, matrices]) => {
      if (!mesh) return;
      matrices.forEach((matrix, instanceId) =>
        mesh.setMatrixAt(instanceId, matrix),
      );
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    });
  }, [features]);

  useEffect(
    () => () => {
      geometry.dispose();
      Object.values(materials).forEach((material) => material.dispose());
    },
    [geometry, materials],
  );

  return (
    <group name={`${tier.id}-vomitories`}>
      <instancedMesh
        ref={ceilingRef}
        args={[geometry, materials.concrete, features.ceilings.length]}
        name={`${tier.id}-vomitory-passage-ceilings`}
      />
      <instancedMesh
        ref={floorRef}
        args={[geometry, materials.floor, features.floors.length]}
        name={`${tier.id}-vomitory-floors`}
      />
      <instancedMesh
        ref={frameRef}
        args={[geometry, materials.frame, features.frames.length]}
        name={`${tier.id}-vomitory-frames`}
      />
      <instancedMesh
        ref={lightRef}
        args={[geometry, materials.light, features.lights.length]}
        name={`${tier.id}-vomitory-passage-lights`}
      />
      <instancedMesh
        ref={signRef}
        args={[geometry, materials.sign, features.signs.length]}
        name={`${tier.id}-vomitory-signs`}
      />
      <instancedMesh
        ref={wallRef}
        args={[geometry, materials.concrete, features.walls.length]}
        name={`${tier.id}-vomitory-passage-side-walls`}
      />
    </group>
  );
}
