import { useEffect, useMemo } from 'react';
import { CylinderGeometry } from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';

type TeamBenchProps = {
  centerX: number;
  centerZ: number;
  team: 'home' | 'away';
};

function TeamBench({ centerX, centerZ, team }: TeamBenchProps) {
  const { structure } = radesStadiumConfig;
  const shelterGeometry = useMemo(() => {
    const radius = structure.benchDepth / 2;
    const geometry = new CylinderGeometry(
      radius,
      radius,
      structure.benchLength,
      structure.benchBayCount * 3,
      1,
      true,
      0,
      Math.PI,
    );
    geometry.rotateZ(Math.PI / 2);
    geometry.scale(1, structure.benchHeight / radius, 1);
    geometry.computeVertexNormals();
    return geometry;
  }, [structure]);
  const frameGeometry = useMemo(() => {
    const radius = structure.benchDepth / 2;
    const geometry = new CylinderGeometry(
      radius,
      radius,
      structure.benchFrameThickness,
      16,
      1,
      true,
      0,
      Math.PI,
    );
    geometry.rotateZ(Math.PI / 2);
    geometry.scale(1, structure.benchHeight / radius, 1);
    geometry.computeVertexNormals();
    return geometry;
  }, [structure]);
  const seatSpacing = (structure.benchLength * 0.86) / structure.benchSeatCount;
  const facesPitch = radesStadiumConfig.grandstand.side === 1 ? Math.PI : 0;

  useEffect(
    () => () => {
      shelterGeometry.dispose();
      frameGeometry.dispose();
    },
    [frameGeometry, shelterGeometry],
  );

  return (
    <group
      name={`${team}-technical-area-shelter`}
      position={[centerX, 0.14, centerZ]}
    >
      <mesh geometry={shelterGeometry} receiveShadow>
        <meshPhysicalMaterial
          color="#5db7d7"
          opacity={0.28}
          roughness={0.18}
          side={2}
          thickness={0.08}
          transparent
        />
      </mesh>

      {Array.from({ length: structure.benchBayCount + 1 }, (_, bayIndex) => (
        <mesh
          key={bayIndex}
          geometry={frameGeometry}
          position={[
            -structure.benchLength / 2 +
              (bayIndex * structure.benchLength) / structure.benchBayCount,
            0,
            0,
          ]}
        >
          <meshStandardMaterial
            color="#e8f2f1"
            metalness={0.5}
            roughness={0.32}
          />
        </mesh>
      ))}

      <mesh position={[0, 0.04, 0]} receiveShadow>
        <boxGeometry
          args={[
            structure.benchLength + 0.25,
            0.16,
            structure.benchDepth + 0.2,
          ]}
        />
        <meshStandardMaterial color="#d9e6e5" roughness={0.7} />
      </mesh>

      {Array.from({ length: structure.benchSeatCount }, (_, seatIndex) => {
        const x =
          -structure.benchLength * 0.43 + seatSpacing * (seatIndex + 0.5);
        return (
          <group
            key={seatIndex}
            position={[x, 0.28, 0.18]}
            rotation={[0, facesPitch, 0]}
          >
            <mesh position={[0, 0.18, 0]} castShadow>
              <boxGeometry args={[seatSpacing * 0.72, 0.12, 0.5]} />
              <meshStandardMaterial color="#15548a" roughness={0.72} />
            </mesh>
            <mesh position={[0, 0.52, 0.2]} rotation={[-0.12, 0, 0]} castShadow>
              <boxGeometry args={[seatSpacing * 0.72, 0.62, 0.11]} />
              <meshStandardMaterial color="#1e6ca4" roughness={0.66} />
            </mesh>
            <mesh position={[0, -0.13, 0.12]}>
              <boxGeometry args={[0.08, 0.58, 0.08]} />
              <meshStandardMaterial color="#dbe7e6" metalness={0.42} />
            </mesh>
          </group>
        );
      })}

      <mesh position={[0, 0.2, structure.benchDepth / 2 + 0.04]}>
        <boxGeometry args={[structure.benchLength, 0.32, 0.08]} />
        <meshStandardMaterial
          color={team === 'home' ? '#17699c' : '#164f7b'}
          roughness={0.54}
        />
      </mesh>
    </group>
  );
}

export function Benches() {
  const { grandstand, pitch, structure } = radesStadiumConfig;
  const centerZ =
    grandstand.side * (pitch.width / 2 + structure.benchSidelineOffset);
  const centerOffsetX =
    structure.benchLength / 2 + structure.benchSeparation / 2;

  return (
    <group
      name="team-benches"
      userData={{
        reference: 'photo-calibrated-rades-blue-segmented-shelters',
      }}
    >
      <TeamBench centerX={-centerOffsetX} centerZ={centerZ} team="home" />
      <TeamBench centerX={centerOffsetX} centerZ={centerZ} team="away" />
    </group>
  );
}
