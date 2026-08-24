import { radesStadiumConfig } from '../config/radesStadiumConfig';

const markingThickness = 0.01;

type RectangleMarkingProps = {
  depth: number;
  width: number;
  x: number;
  openSide: 'left' | 'right';
};

function RectangleMarking({
  depth,
  openSide,
  width,
  x,
}: RectangleMarkingProps) {
  const { lineWidth } = radesStadiumConfig.pitch;
  const sideX = openSide === 'left' ? x + depth : x - depth;

  return (
    <group>
      <mesh position={[sideX, 0, 0]}>
        <boxGeometry args={[lineWidth, markingThickness, width]} />
        <meshBasicMaterial color="#f4f3de" />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[(x + sideX) / 2, 0, (side * width) / 2]}>
          <boxGeometry args={[depth, markingThickness, lineWidth]} />
          <meshBasicMaterial color="#f4f3de" />
        </mesh>
      ))}
    </group>
  );
}

export function PitchMarkings() {
  const pitch = radesStadiumConfig.pitch;
  const halfLength = pitch.length / 2;
  const halfWidth = pitch.width / 2;
  const markingY = 0.069;

  return (
    <group position={[0, markingY, 0]} name="pitch-markings">
      {[
        {
          position: [0, 0, -halfWidth] as const,
          size: [pitch.length, pitch.lineWidth] as const,
        },
        {
          position: [0, 0, halfWidth] as const,
          size: [pitch.length, pitch.lineWidth] as const,
        },
        {
          position: [-halfLength, 0, 0] as const,
          size: [pitch.lineWidth, pitch.width] as const,
        },
        {
          position: [halfLength, 0, 0] as const,
          size: [pitch.lineWidth, pitch.width] as const,
        },
        {
          position: [0, 0, 0] as const,
          size: [pitch.lineWidth, pitch.width] as const,
        },
      ].map(({ position, size }, index) => (
        <mesh key={index} position={position}>
          <boxGeometry args={[size[0], markingThickness, size[1]]} />
          <meshBasicMaterial color="#f4f3de" />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry
          args={[
            pitch.centerCircleRadius - pitch.lineWidth / 2,
            pitch.centerCircleRadius + pitch.lineWidth / 2,
            96,
          ]}
        />
        <meshBasicMaterial color="#f4f3de" />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.16, 0.16, markingThickness, 20]} />
        <meshBasicMaterial color="#f4f3de" />
      </mesh>

      {([-1, 1] as const).map((side) => {
        const goalLineX = side * halfLength;
        const openSide = side === -1 ? 'left' : 'right';
        const penaltySpotX = side * (halfLength - pitch.penaltySpotDistance);

        return (
          <group key={side}>
            <RectangleMarking
              depth={pitch.penaltyAreaLength}
              openSide={openSide}
              width={pitch.penaltyAreaWidth}
              x={goalLineX}
            />
            <RectangleMarking
              depth={pitch.goalAreaLength}
              openSide={openSide}
              width={pitch.goalAreaWidth}
              x={goalLineX}
            />
            <mesh position={[penaltySpotX, 0, 0]}>
              <cylinderGeometry args={[0.16, 0.16, markingThickness, 20]} />
              <meshBasicMaterial color="#f4f3de" />
            </mesh>
          </group>
        );
      })}

      {([-1, 1] as const).flatMap((xSide) =>
        ([-1, 1] as const).map((zSide) => (
          <mesh
            key={`${xSide}-${zSide}`}
            position={[xSide * halfLength, 0, zSide * halfWidth]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry
              args={[
                pitch.cornerArcRadius - pitch.lineWidth / 2,
                pitch.cornerArcRadius + pitch.lineWidth / 2,
                24,
                1,
                xSide === zSide ? Math.PI : 0,
                Math.PI / 2,
              ]}
            />
            <meshBasicMaterial color="#f4f3de" />
          </mesh>
        )),
      )}
    </group>
  );
}
