import { radesStadiumConfig } from '../config/radesStadiumConfig';

export function Benches() {
  const { pitch, structure } = radesStadiumConfig;

  return (
    <group name="team-benches">
      {([-1, 1] as const).map((side) => (
        <group
          key={side}
          position={[
            side * (structure.benchLength * 0.8),
            structure.benchHeight / 2,
            pitch.width / 2 + structure.benchDepth,
          ]}
        >
          <mesh>
            <boxGeometry
              args={[
                structure.benchLength,
                structure.benchHeight,
                structure.benchDepth,
              ]}
            />
            <meshStandardMaterial
              color="#9dbbb2"
              opacity={0.36}
              roughness={0.38}
              transparent
            />
          </mesh>
          <mesh position={[0, -structure.benchHeight * 0.28, 0]}>
            <boxGeometry
              args={[
                structure.benchLength * 0.86,
                0.42,
                structure.benchDepth * 0.42,
              ]}
            />
            <meshStandardMaterial color="#183f36" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
