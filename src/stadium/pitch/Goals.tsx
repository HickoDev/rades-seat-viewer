import { useEffect, useMemo } from 'react';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { createGoalNetGeometry } from './createGoalNetGeometry';

type GoalFrameProps = {
  side: -1 | 1;
};

function GoalFrame({ side }: GoalFrameProps) {
  const { fieldFurniture, pitch } = radesStadiumConfig;
  const postRadius = fieldFurniture.goalPostRadius;
  const goalX = side * (pitch.length / 2 + postRadius);
  const depthDirection = side;
  const netGeometry = useMemo(
    () =>
      createGoalNetGeometry({
        side,
        goalLineX: pitch.length / 2 + postRadius,
        width: pitch.goalWidth,
        height: pitch.goalHeight,
        groundDepth: pitch.goalDepth,
        topDepth: fieldFurniture.goalNetTopDepth,
        gridSpacing: fieldFurniture.goalNetGridSpacing,
      }),
    [fieldFurniture, pitch, postRadius, side],
  );

  useEffect(() => () => netGeometry.dispose(), [netGeometry]);

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
      {([-1, 1] as const).map((zSide) => (
        <mesh
          key={`support-${zSide}`}
          position={[
            goalX + (depthDirection * fieldFurniture.goalNetTopDepth) / 2,
            pitch.goalHeight,
            (zSide * pitch.goalWidth) / 2,
          ]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry
            args={[
              postRadius * 0.58,
              postRadius * 0.58,
              fieldFurniture.goalNetTopDepth,
              8,
            ]}
          />
          <meshStandardMaterial color="#f6f5e8" roughness={0.5} />
        </mesh>
      ))}
      <lineSegments geometry={netGeometry} name="goal-net">
        <lineBasicMaterial
          color="#f4f1df"
          depthWrite={false}
          opacity={0.78}
          transparent
        />
      </lineSegments>
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
