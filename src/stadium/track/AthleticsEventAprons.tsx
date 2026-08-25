import { useEffect, useMemo } from 'react';
import { DoubleSide } from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { createAthleticsEventApronGeometry } from './createAthleticsEventGeometry';

export function AthleticsEventAprons() {
  const { pitch, track } = radesStadiumConfig;
  const geometry = useMemo(
    () =>
      createAthleticsEventApronGeometry({
        curveRadius: track.innerCurveRadius,
        pitchLength: pitch.length,
        startOffset: track.endApronStartOffset,
        straightLength: track.straightLength,
      }),
    [pitch.length, track],
  );
  const apronStartX = pitch.length / 2 + track.endApronStartOffset;
  const runwayCenterX = apronStartX + track.endApronRunwayLength / 2;
  const runwayLineSpacing =
    track.endApronRunwayWidth / (track.endApronRunwayLineCount - 1);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group
      name="track-bend-field-event-aprons"
      userData={{ dimensionsAreEstimates: true }}
    >
      {([-1, 1] as const).map((side) => (
        <group key={side} scale={[side, 1, 1]}>
          <mesh
            geometry={geometry}
            position={[0, 0.055, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <meshStandardMaterial
              color="#b8aa88"
              roughness={0.97}
              side={DoubleSide}
            />
          </mesh>
          {Array.from(
            { length: track.endApronRunwayLineCount },
            (_, lineIndex) => (
              <mesh
                key={lineIndex}
                position={[
                  runwayCenterX,
                  0.078,
                  -track.endApronRunwayWidth / 2 +
                    lineIndex * runwayLineSpacing,
                ]}
              >
                <boxGeometry args={[track.endApronRunwayLength, 0.018, 0.07]} />
                <meshBasicMaterial color="#eee9d7" />
              </mesh>
            ),
          )}
          <mesh position={[apronStartX, 0.079, 0]}>
            <boxGeometry
              args={[0.07, 0.02, track.endApronRunwayWidth + 0.08]}
            />
            <meshBasicMaterial color="#eee9d7" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
