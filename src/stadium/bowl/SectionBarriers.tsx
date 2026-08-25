import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  CylinderGeometry,
  DoubleSide,
  MeshStandardMaterial,
  type InstancedMesh,
} from 'three';

import type { StadiumConfig } from '../types/stadium.types';
import { createSectionDividerPanelGeometry } from './createSectionDividerPanelGeometry';
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
  const panelGeometry = useMemo(
    () => createSectionDividerPanelGeometry(tier, barrier),
    [barrier, tier],
  );
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
      panelGeometry.dispose();
      material.dispose();
    },
    [geometry, material, panelGeometry],
  );

  return (
    <group name={`${tier.id}-section-barriers`}>
      <mesh
        geometry={panelGeometry}
        name={`${tier.id}-solid-divider-panels`}
        receiveShadow
      >
        <meshStandardMaterial
          color="#aeb4af"
          roughness={0.94}
          side={DoubleSide}
        />
      </mesh>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, matrices.length]}
        castShadow={false}
        name={`${tier.id}-divider-rails`}
        receiveShadow={false}
        userData={{ circulationRole: 'section-edge-barrier' }}
      />
    </group>
  );
}
