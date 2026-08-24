import { DoubleSide } from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';

function PalmTree({ x, z }: { x: number; z: number }) {
  const height = 7.4;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.22, 0.38, height, 9]} />
        <meshStandardMaterial color="#80654a" roughness={0.95} />
      </mesh>
      {Array.from({ length: 8 }, (_, leafIndex) => {
        const angle = (leafIndex / 8) * Math.PI * 2;
        return (
          <mesh
            key={leafIndex}
            position={[
              Math.cos(angle) * 1.2,
              height + 0.15,
              Math.sin(angle) * 1.2,
            ]}
            rotation={[0, -angle, Math.PI / 2]}
          >
            <coneGeometry args={[0.48, 3.8, 6]} />
            <meshStandardMaterial color="#2c6545" roughness={0.92} />
          </mesh>
        );
      })}
    </group>
  );
}

export function EntrancePlaza() {
  const { exterior, roof, structure } = radesStadiumConfig;
  const side = exterior.mainEntranceSide;
  const entranceFrontZ =
    side *
    (roof.outerRadiusZ +
      structure.exteriorRadiusOffset +
      exterior.mainEntranceDepth);
  const centerZ = entranceFrontZ + (side * exterior.plazaDepth) / 2;
  const palmSpacing = exterior.plazaWidth * 0.34;

  return (
    <group
      name="ceremonial-entrance-plaza"
      userData={{ dimensionsAreEstimates: true }}
    >
      <mesh position={[0, 0.02, centerZ]} receiveShadow>
        <boxGeometry args={[exterior.plazaWidth, 0.1, exterior.plazaDepth]} />
        <meshStandardMaterial color="#b9a98f" roughness={0.98} />
      </mesh>
      <mesh position={[0, 0.085, centerZ]}>
        <boxGeometry args={[17, 0.04, exterior.plazaDepth]} />
        <meshStandardMaterial color="#d0c5aa" roughness={0.94} />
      </mesh>
      {([-1, 1] as const).map((pathSide) => (
        <mesh
          key={pathSide}
          position={[
            pathSide * 10.2,
            0.11,
            centerZ + side * exterior.plazaDepth * 0.08,
          ]}
        >
          <boxGeometry args={[1.2, 0.05, exterior.plazaDepth * 0.84]} />
          <meshStandardMaterial color="#d4b83f" roughness={0.82} />
        </mesh>
      ))}
      {Array.from({ length: exterior.flagpoleCount }, (_, poleIndex) => {
        const x =
          ((poleIndex + 0.5) / exterior.flagpoleCount - 0.5) *
          exterior.plazaWidth *
          0.76;
        const z = centerZ - side * exterior.plazaDepth * 0.12;
        return (
          <group key={poleIndex} position={[x, 0, z]}>
            <mesh position={[0, exterior.flagpoleHeight / 2, 0]}>
              <cylinderGeometry
                args={[0.045, 0.075, exterior.flagpoleHeight, 7]}
              />
              <meshStandardMaterial
                color="#e5e9e6"
                metalness={0.48}
                roughness={0.4}
              />
            </mesh>
            <mesh position={[0.75, exterior.flagpoleHeight - 1.15, 0]}>
              <planeGeometry args={[1.5, 0.95]} />
              <meshStandardMaterial
                color="#c61e32"
                roughness={0.76}
                side={DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
      {Array.from({ length: exterior.palmCount }, (_, palmIndex) => {
        const xSide = palmIndex % 2 === 0 ? -1 : 1;
        const row = Math.floor(palmIndex / 2);
        return (
          <PalmTree
            key={palmIndex}
            x={xSide * palmSpacing}
            z={centerZ + side * (row * 14 - 7)}
          />
        );
      })}
      {([-1, 1] as const).flatMap((xSide) =>
        [-0.28, 0.05, 0.32].map((depthRatio) => (
          <mesh
            key={`${xSide}:${depthRatio}`}
            position={[
              xSide * exterior.plazaWidth * 0.29,
              0.75,
              centerZ + side * exterior.plazaDepth * depthRatio,
            ]}
            scale={[1.7, 0.72, 1.25]}
          >
            <dodecahedronGeometry args={[1.2, 0]} />
            <meshStandardMaterial color="#436d45" roughness={0.96} />
          </mesh>
        )),
      )}
    </group>
  );
}
