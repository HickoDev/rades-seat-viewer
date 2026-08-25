import { useEffect, useMemo } from 'react';
import { DoubleSide } from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { createAthleticsEventApronGeometry } from './createAthleticsEventGeometry';

export function AthleticsEventAprons() {
  const { pitch, track } = radesStadiumConfig;
  const apronGeometries = useMemo(
    () =>
      track.eventEnds.map((eventEnd) =>
        createAthleticsEventApronGeometry({
          curveRadius: track.innerCurveRadius,
          pitchLength: pitch.length,
          startOffset: eventEnd.apronStartOffset,
          straightLength: track.straightLength,
        }),
      ),
    [pitch.length, track],
  );

  useEffect(
    () => () => apronGeometries.forEach((geometry) => geometry.dispose()),
    [apronGeometries],
  );

  return (
    <group
      name="asymmetric-track-bend-field-event-facilities"
      userData={{ dimensionsAreEstimates: true }}
    >
      {track.eventEnds.map((eventEnd, eventIndex) => {
        const apronStartX = pitch.length / 2 + eventEnd.apronStartOffset;
        const runwayCenterX = apronStartX + eventEnd.runwayLength / 2;
        const runwayLineSpacing =
          eventEnd.runwayWidth / Math.max(eventEnd.runwayLineCount - 1, 1);
        const sandPitCenterX =
          pitch.length / 2 +
          eventEnd.sandPitOffsetFromPitchEnd +
          eventEnd.sandPitLength / 2;
        const throwingCircleX =
          pitch.length / 2 + eventEnd.throwingCircleOffsetFromPitchEnd;

        return (
          <group
            key={eventEnd.id}
            name={eventEnd.id}
            scale={[eventEnd.side, 1, 1]}
          >
            <mesh
              geometry={apronGeometries[eventIndex]}
              position={[0, 0.055, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              receiveShadow
            >
              <meshStandardMaterial
                color={eventEnd.side === -1 ? '#b8aa88' : '#b2a582'}
                roughness={0.97}
                side={DoubleSide}
              />
            </mesh>

            <mesh
              position={[runwayCenterX, 0.068, eventEnd.runwayOffsetZ]}
              receiveShadow
            >
              <boxGeometry
                args={[
                  eventEnd.runwayLength,
                  0.025,
                  eventEnd.runwayWidth + 0.35,
                ]}
              />
              <meshStandardMaterial color="#a95443" roughness={0.9} />
            </mesh>
            {Array.from(
              { length: eventEnd.runwayLineCount },
              (_, lineIndex) => (
                <mesh
                  key={lineIndex}
                  position={[
                    runwayCenterX,
                    0.088,
                    eventEnd.runwayOffsetZ -
                      eventEnd.runwayWidth / 2 +
                      lineIndex * runwayLineSpacing,
                  ]}
                >
                  <boxGeometry args={[eventEnd.runwayLength, 0.018, 0.065]} />
                  <meshBasicMaterial color="#eee9d7" />
                </mesh>
              ),
            )}
            <mesh position={[apronStartX, 0.089, eventEnd.runwayOffsetZ]}>
              <boxGeometry args={[0.16, 0.02, eventEnd.runwayWidth + 0.28]} />
              <meshBasicMaterial color="#f2eee1" />
            </mesh>

            <group
              name={`${eventEnd.id}-long-jump-pit`}
              position={[sandPitCenterX, 0.085, eventEnd.sandPitOffsetZ]}
            >
              <mesh receiveShadow>
                <boxGeometry
                  args={[
                    eventEnd.sandPitLength + 0.45,
                    0.08,
                    eventEnd.sandPitWidth + 0.45,
                  ]}
                />
                <meshStandardMaterial color="#eee9dc" roughness={0.94} />
              </mesh>
              <mesh position={[0, 0.055, 0]}>
                <boxGeometry
                  args={[eventEnd.sandPitLength, 0.06, eventEnd.sandPitWidth]}
                />
                <meshStandardMaterial color="#d9bd7d" roughness={1} />
              </mesh>
              <mesh position={[-eventEnd.sandPitLength / 2 - 1.15, 0.06, 0]}>
                <boxGeometry args={[0.22, 0.045, eventEnd.sandPitWidth]} />
                <meshBasicMaterial color="#f4f0e5" />
              </mesh>
            </group>

            <group
              name={`${eventEnd.id}-throwing-circle`}
              position={[throwingCircleX, 0.09, eventEnd.throwingCircleOffsetZ]}
            >
              <mesh receiveShadow>
                <cylinderGeometry
                  args={[
                    eventEnd.throwingCircleRadius,
                    eventEnd.throwingCircleRadius,
                    0.08,
                    40,
                  ]}
                />
                <meshStandardMaterial color="#cbc9bd" roughness={0.96} />
              </mesh>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry
                  args={[eventEnd.throwingCircleRadius, 0.055, 6, 40]}
                />
                <meshStandardMaterial
                  color="#f2f3ee"
                  metalness={0.28}
                  roughness={0.54}
                />
              </mesh>
              {Array.from({ length: 5 }, (_, postIndex) => {
                const angle = -Math.PI * 0.75 + (postIndex * Math.PI * 1.5) / 4;
                const radius = eventEnd.throwingCircleRadius + 1.25;
                return (
                  <mesh
                    key={postIndex}
                    position={[
                      Math.cos(angle) * radius,
                      1.2,
                      Math.sin(angle) * radius,
                    ]}
                  >
                    <cylinderGeometry args={[0.035, 0.05, 2.4, 6]} />
                    <meshStandardMaterial
                      color="#dfe3df"
                      metalness={0.48}
                      roughness={0.44}
                    />
                  </mesh>
                );
              })}
            </group>
          </group>
        );
      })}
    </group>
  );
}
