import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  CylinderGeometry,
  MeshStandardMaterial,
  type InstancedMesh,
} from 'three';

import type { StadiumConfig } from '../types/stadium.types';
import { createSectionBarrierMatrices } from './createSectionBarrierMatrices';

type TierConfig = StadiumConfig['tiers'][number];
type BarrierConfig = StadiumConfig['bowlDetails'];

export function SectionBarriers({
  barrier,
  tier,
}: {
  barrier: BarrierConfig;
  tier: TierConfig;
}) {
  const meshRef = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => new CylinderGeometry(1, 1, 1, 6), []);
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#c7cfca',
        metalness: 0.62,
        roughness: 0.38,
      }),
    [],
  );
  const matrices = useMemo(
    () => createSectionBarrierMatrices(tier, barrier),
    [barrier, tier],
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    matrices.forEach((matrix, instanceId) => {
      mesh.setMatrixAt(instanceId, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
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
      args={[geometry, material, matrices.length]}
      castShadow={false}
      name={`${tier.id}-section-barriers`}
      receiveShadow={false}
      userData={{ circulationRole: 'section-edge-barrier' }}
    />
  );
}
