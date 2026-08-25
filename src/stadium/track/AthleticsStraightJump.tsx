import { radesStadiumConfig } from '../config/radesStadiumConfig';

/** Straight-side jump runway visible outside the main oval straight. */
export function AthleticsStraightJump() {
  const { track } = radesStadiumConfig;
  const jump = track.straightJump;
  const trackOuterRadius =
    track.innerCurveRadius + track.laneCount * track.laneWidth;
  const z = jump.side * (trackOuterRadius + jump.outsideOffset);
  const pitCenterX =
    jump.centerX +
    jump.direction * (jump.runwayLength / 2 + jump.pitLength / 2 + 0.18);
  const takeoffX =
    jump.centerX + jump.direction * (jump.runwayLength / 2 - 1.05);

  return (
    <group
      name="straight-side-long-jump-facility"
      userData={{ dimensionsAreEstimates: true }}
    >
      <mesh position={[jump.centerX, 0.07, z]} receiveShadow>
        <boxGeometry
          args={[jump.runwayLength, 0.035, jump.runwayWidth + 0.18]}
        />
        <meshStandardMaterial color="#a94f3e" roughness={0.9} />
      </mesh>

      {([-1, 1] as const).map((edge) => (
        <mesh
          key={edge}
          position={[jump.centerX, 0.092, z + (edge * jump.runwayWidth) / 2]}
        >
          <boxGeometry args={[jump.runwayLength, 0.012, 0.055]} />
          <meshBasicMaterial color="#f4eee0" />
        </mesh>
      ))}

      <mesh position={[takeoffX, 0.096, z]}>
        <boxGeometry args={[0.24, 0.018, jump.runwayWidth]} />
        <meshBasicMaterial color="#f7f4e9" />
      </mesh>

      <group position={[pitCenterX, 0.09, z]} name="straight-jump-sand-pit">
        <mesh receiveShadow>
          <boxGeometry
            args={[jump.pitLength + 0.4, 0.08, jump.pitWidth + 0.4]}
          />
          <meshStandardMaterial color="#eee9dc" roughness={0.94} />
        </mesh>
        <mesh position={[0, 0.055, 0]} receiveShadow>
          <boxGeometry args={[jump.pitLength, 0.06, jump.pitWidth]} />
          <meshStandardMaterial color="#d7bc7c" roughness={1} />
        </mesh>
      </group>
    </group>
  );
}
