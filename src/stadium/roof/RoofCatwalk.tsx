import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  CylinderGeometry,
  MeshStandardMaterial,
  type InstancedMesh,
} from 'three';

import { createEllipticalRingGeometry } from '../bowl/createTierGeometry';
import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { createRoofCatwalkRailMatrices } from './createRoofCatwalkRailMatrices';

export function RoofCatwalk() {
  const railRef = useRef<InstancedMesh>(null);
  const { roof } = radesStadiumConfig;
  const floorGeometry = useMemo(
    () =>
      createEllipticalRingGeometry({
        innerRadiusX: roof.innerRadiusX + 0.8,
        innerRadiusZ: roof.innerRadiusZ + 0.8,
        outerRadiusX: roof.innerRadiusX + 0.8 + roof.innerCatwalkWidth,
        outerRadiusZ: roof.innerRadiusZ + 0.8 + roof.innerCatwalkWidth,
        height: roof.innerCatwalkHeight,
        segments: roof.innerCatwalkRailSegmentCount * 2,
      }),
    [roof],
  );
  const railGeometry = useMemo(() => new CylinderGeometry(1, 1, 1, 6), []);
  const railMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#d9ddda',
        metalness: 0.62,
        roughness: 0.38,
      }),
    [],
  );
  const railMatrices = useMemo(
    () =>
      createRoofCatwalkRailMatrices({
        innerRadiusX: roof.innerRadiusX + 0.8,
        innerRadiusZ: roof.innerRadiusZ + 0.8,
        width: roof.innerCatwalkWidth,
        height: roof.innerCatwalkHeight,
        railHeight: roof.innerCatwalkRailHeight,
        segmentCount: roof.innerCatwalkRailSegmentCount,
        radius: 0.035,
      }),
    [roof],
  );

  useLayoutEffect(() => {
    const railMesh = railRef.current;
    if (!railMesh) return;
    railMatrices.forEach((matrix, instanceId) =>
      railMesh.setMatrixAt(instanceId, matrix),
    );
    railMesh.instanceMatrix.needsUpdate = true;
    railMesh.computeBoundingSphere();
  }, [railMatrices]);

  useEffect(
    () => () => {
      floorGeometry.dispose();
      railGeometry.dispose();
      railMaterial.dispose();
    },
    [floorGeometry, railGeometry, railMaterial],
  );

  return (
    <group name="inner-roof-maintenance-catwalk">
      <mesh geometry={floorGeometry} receiveShadow>
        <meshStandardMaterial
          color="#626a67"
          metalness={0.34}
          roughness={0.66}
          side={2}
        />
      </mesh>
      <instancedMesh
        ref={railRef}
        args={[railGeometry, railMaterial, railMatrices.length]}
        name="catwalk-guardrails"
      />
    </group>
  );
}
