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
              color="#84bad3"
              opacity={0.3}
              roughness={0.26}
              transparent
            />
          </mesh>
          {Array.from(
            { length: structure.benchBayCount + 1 },
            (_, bayIndex) => (
              <mesh
                key={bayIndex}
                position={[
                  -structure.benchLength / 2 +
                    (bayIndex * structure.benchLength) /
                      structure.benchBayCount,
                  0,
                  0,
                ]}
              >
                <boxGeometry
                  args={[
                    structure.benchFrameThickness,
                    structure.benchHeight,
                    structure.benchDepth,
                  ]}
                />
                <meshStandardMaterial
                  color="#d8e8e9"
                  metalness={0.42}
                  roughness={0.4}
                />
              </mesh>
            ),
          )}
          <mesh position={[0, structure.benchHeight / 2, 0]}>
            <boxGeometry
              args={[
                structure.benchLength,
                structure.benchFrameThickness * 1.8,
                structure.benchDepth,
              ]}
            />
            <meshStandardMaterial
              color="#2678a4"
              metalness={0.18}
              roughness={0.5}
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
