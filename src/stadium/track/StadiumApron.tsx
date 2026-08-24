import { useEffect, useMemo } from 'react';
import { DoubleSide } from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { createCapsuleInfieldGeometry } from './createCapsuleInfieldGeometry';

export function StadiumApron() {
  const { tiers, track } = radesStadiumConfig;
  const lowerTier = tiers.find((tier) => tier.id === 'lower') ?? tiers[0];
  const infieldGeometry = useMemo(
    () =>
      createCapsuleInfieldGeometry(
        track.innerCurveRadius,
        track.straightLength,
      ),
    [track.innerCurveRadius, track.straightLength],
  );

  useEffect(() => () => infieldGeometry.dispose(), [infieldGeometry]);

  return (
    <group name="stadium-ground-surfaces">
      <mesh
        position={[0, -0.065, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[lowerTier.startRadiusX, lowerTier.startRadiusZ, 1]}
        receiveShadow
      >
        <circleGeometry args={[1, 192]} />
        <meshStandardMaterial color="#8d9690" roughness={0.98} />
      </mesh>
      <mesh
        geometry={infieldGeometry}
        position={[0, -0.035, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          color="#2a623f"
          roughness={0.96}
          side={DoubleSide}
        />
      </mesh>
    </group>
  );
}
