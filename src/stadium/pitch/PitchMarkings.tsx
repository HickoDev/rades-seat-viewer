import { Line } from '@react-three/drei';

import { radesStadiumConfig } from '../config/radesStadiumConfig';

// Regulation width stays in configuration. The minimum below is a rendering
// allowance so markings remain at least one pixel wide in the stadium overview.
const visualLineWidth = Math.max(radesStadiumConfig.pitch.lineWidth, 0.32);
const markingThickness = 0.025;
const screenLineWidth = 1.4;
const markingColor = '#fffdf0';

type MarkingPoint = [number, number, number];

function createArcPoints(
  centerX: number,
  centerZ: number,
  radius: number,
  startAngle: number,
  angleLength: number,
  segments: number,
): MarkingPoint[] {
  return Array.from({ length: segments + 1 }, (_, index) => {
    const angle = startAngle + (angleLength * index) / segments;
    return [
      centerX + Math.cos(angle) * radius,
      0,
      centerZ + Math.sin(angle) * radius,
    ];
  });
}

function createAreaLinePoints(
  goalLineX: number,
  depth: number,
  width: number,
  side: -1 | 1,
): MarkingPoint[] {
  const innerX = side * (Math.abs(goalLineX) - depth);
  return [
    [goalLineX, 0, -width / 2],
    [innerX, 0, -width / 2],
    [innerX, 0, width / 2],
    [goalLineX, 0, width / 2],
  ];
}

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
  const sideX = openSide === 'left' ? x + depth : x - depth;

  return (
    <group>
      <mesh position={[sideX, 0, 0]}>
        <boxGeometry args={[visualLineWidth, markingThickness, width]} />
        <meshBasicMaterial color="#fffdf0" />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[(x + sideX) / 2, 0, (side * width) / 2]}>
          <boxGeometry args={[depth, markingThickness, visualLineWidth]} />
          <meshBasicMaterial color="#fffdf0" />
        </mesh>
      ))}
    </group>
  );
}

export function PitchMarkings() {
  const pitch = radesStadiumConfig.pitch;
  const halfLength = pitch.length / 2;
  const halfWidth = pitch.width / 2;
  const markingY = 0.085;
  const penaltyArcHalfAngle = Math.acos(
    (pitch.penaltyAreaLength - pitch.penaltySpotDistance) /
      pitch.centerCircleRadius,
  );
  const fieldOutline: MarkingPoint[] = [
    [-halfLength, 0, -halfWidth],
    [halfLength, 0, -halfWidth],
    [halfLength, 0, halfWidth],
    [-halfLength, 0, halfWidth],
    [-halfLength, 0, -halfWidth],
  ];

  return (
    <group position={[0, markingY, 0]} name="pitch-markings">
      {[
        {
          position: [0, 0, -halfWidth] as const,
          size: [pitch.length, visualLineWidth] as const,
        },
        {
          position: [0, 0, halfWidth] as const,
          size: [pitch.length, visualLineWidth] as const,
        },
        {
          position: [-halfLength, 0, 0] as const,
          size: [visualLineWidth, pitch.width] as const,
        },
        {
          position: [halfLength, 0, 0] as const,
          size: [visualLineWidth, pitch.width] as const,
        },
        {
          position: [0, 0, 0] as const,
          size: [visualLineWidth, pitch.width] as const,
        },
      ].map(({ position, size }, index) => (
        <mesh key={index} position={position}>
          <boxGeometry args={[size[0], markingThickness, size[1]]} />
          <meshBasicMaterial color="#fffdf0" />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry
          args={[
            pitch.centerCircleRadius - visualLineWidth / 2,
            pitch.centerCircleRadius + visualLineWidth / 2,
            96,
          ]}
        />
        <meshBasicMaterial color="#fffdf0" />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.22, 0.22, markingThickness, 20]} />
        <meshBasicMaterial color="#fffdf0" />
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
              <cylinderGeometry args={[0.22, 0.22, markingThickness, 20]} />
              <meshBasicMaterial color="#fffdf0" />
            </mesh>
            <mesh
              position={[penaltySpotX, 0, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <ringGeometry
                args={[
                  pitch.centerCircleRadius - visualLineWidth / 2,
                  pitch.centerCircleRadius + visualLineWidth / 2,
                  48,
                  1,
                  side === -1
                    ? -penaltyArcHalfAngle
                    : Math.PI - penaltyArcHalfAngle,
                  penaltyArcHalfAngle * 2,
                ]}
              />
              <meshBasicMaterial color="#fffdf0" />
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
                pitch.cornerArcRadius - visualLineWidth / 2,
                pitch.cornerArcRadius + visualLineWidth / 2,
                24,
                1,
                xSide === zSide ? Math.PI : 0,
                Math.PI / 2,
              ]}
            />
            <meshBasicMaterial color="#fffdf0" />
          </mesh>
        )),
      )}

      <group position={[0, 0.03, 0]} name="overview-pitch-markings">
        <Line
          color={markingColor}
          lineWidth={screenLineWidth}
          points={fieldOutline}
          toneMapped={false}
        />
        <Line
          color={markingColor}
          lineWidth={screenLineWidth}
          points={[
            [0, 0, -halfWidth],
            [0, 0, halfWidth],
          ]}
          toneMapped={false}
        />
        <Line
          color={markingColor}
          lineWidth={screenLineWidth}
          points={createArcPoints(
            0,
            0,
            pitch.centerCircleRadius,
            0,
            Math.PI * 2,
            96,
          )}
          toneMapped={false}
        />
        {([-1, 1] as const).map((side) => {
          const goalLineX = side * halfLength;
          const penaltySpotX = side * (halfLength - pitch.penaltySpotDistance);
          return (
            <group key={side}>
              <Line
                color={markingColor}
                lineWidth={screenLineWidth}
                points={createAreaLinePoints(
                  goalLineX,
                  pitch.penaltyAreaLength,
                  pitch.penaltyAreaWidth,
                  side,
                )}
                toneMapped={false}
              />
              <Line
                color={markingColor}
                lineWidth={screenLineWidth}
                points={createAreaLinePoints(
                  goalLineX,
                  pitch.goalAreaLength,
                  pitch.goalAreaWidth,
                  side,
                )}
                toneMapped={false}
              />
              <Line
                color={markingColor}
                lineWidth={screenLineWidth}
                points={createArcPoints(
                  penaltySpotX,
                  0,
                  pitch.centerCircleRadius,
                  side === -1
                    ? -penaltyArcHalfAngle
                    : Math.PI - penaltyArcHalfAngle,
                  penaltyArcHalfAngle * 2,
                  32,
                )}
                toneMapped={false}
              />
            </group>
          );
        })}
      </group>
    </group>
  );
}
