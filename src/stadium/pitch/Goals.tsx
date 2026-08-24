import { radesStadiumConfig } from '../config/radesStadiumConfig';

type GoalFrameProps = {
  side: -1 | 1;
};

function GoalFrame({ side }: GoalFrameProps) {
  const pitch = radesStadiumConfig.pitch;
  const postRadius = 0.06;
  const goalX = side * (pitch.length / 2 + postRadius);
  const depthDirection = side;

  return (
    <group name={side === -1 ? 'west-goal' : 'east-goal'}>
      {([-1, 1] as const).map((zSide) => (
        <mesh
          key={zSide}
          position={[
            goalX,
            pitch.goalHeight / 2,
            (zSide * pitch.goalWidth) / 2,
          ]}
        >
          <cylinderGeometry
            args={[postRadius, postRadius, pitch.goalHeight, 12]}
          />
          <meshStandardMaterial color="#f6f5e8" roughness={0.48} />
        </mesh>
      ))}
      <mesh
        position={[goalX, pitch.goalHeight, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry
          args={[postRadius, postRadius, pitch.goalWidth, 12]}
        />
        <meshStandardMaterial color="#f6f5e8" roughness={0.48} />
      </mesh>

      <mesh
        position={[
          goalX + depthDirection * pitch.goalDepth,
          pitch.goalHeight / 2,
          0,
        ]}
      >
        <boxGeometry
          args={[pitch.lineWidth, pitch.goalHeight, pitch.goalWidth]}
        />
        <meshBasicMaterial
          color="#d8e5de"
          transparent
          opacity={0.12}
          wireframe
        />
      </mesh>
    </group>
  );
}

export function Goals() {
  return (
    <group name="goals">
      <GoalFrame side={-1} />
      <GoalFrame side={1} />
    </group>
  );
}
