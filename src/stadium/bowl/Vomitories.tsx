import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { BoxGeometry, MeshStandardMaterial, type InstancedMesh } from 'three';

import type { StadiumConfig } from '../types/stadium.types';
import { createVomitoryFeatureMatrices } from './createVomitoryFeatureMatrices';

type TierConfig = StadiumConfig['tiers'][number];

export function Vomitories({ tier }: { tier: TierConfig }) {
  const panelRef = useRef<InstancedMesh>(null);
  const floorRef = useRef<InstancedMesh>(null);
  const frameRef = useRef<InstancedMesh>(null);
  const signRef = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const features = useMemo(() => createVomitoryFeatureMatrices(tier), [tier]);
  const materials = useMemo(
    () => ({
      floor: new MeshStandardMaterial({
        color: '#89948e',
        roughness: 0.96,
      }),
      frame: new MeshStandardMaterial({
        color: '#b8c0ba',
        roughness: 0.93,
      }),
      panel: new MeshStandardMaterial({
        color: '#20292a',
        emissive: '#0d1516',
        emissiveIntensity: 0.12,
        roughness: 0.82,
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
      [panelRef.current, features.panels],
      [floorRef.current, features.floors],
      [frameRef.current, features.frames],
      [signRef.current, features.signs],
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
        ref={panelRef}
        args={[geometry, materials.panel, features.panels.length]}
        name={`${tier.id}-vomitory-interiors`}
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
        ref={signRef}
        args={[geometry, materials.sign, features.signs.length]}
        name={`${tier.id}-vomitory-signs`}
      />
    </group>
  );
}
