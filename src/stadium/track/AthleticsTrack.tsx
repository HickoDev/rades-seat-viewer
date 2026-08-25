import { useEffect, useMemo } from 'react';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { createTrackGeometry } from './createTrackGeometry';

export function AthleticsTrack() {
  const track = radesStadiumConfig.track;
  const trackGeometry = useMemo(
    () =>
      createTrackGeometry({
        innerRadius: track.innerCurveRadius,
        laneCount: track.laneCount,
        laneWidth: track.laneWidth,
        straightLength: track.straightLength,
      }),
    [track],
  );

  const laneGeometries = useMemo(
    () =>
      Array.from({ length: track.laneCount + 1 }, (_, laneIndex) =>
        createTrackGeometry({
          innerRadius:
            track.innerCurveRadius + laneIndex * track.laneWidth - 0.025,
          laneCount: 1,
          laneWidth: 0.05,
          straightLength: track.straightLength,
        }),
      ),
    [track],
  );
  const innerKerbGeometry = useMemo(
    () =>
      createTrackGeometry({
        innerRadius: track.innerCurveRadius - track.innerKerbWidth,
        laneCount: 1,
        laneWidth: track.innerKerbWidth,
        straightLength: track.straightLength,
      }),
    [track],
  );
  const drainChannelGeometry = useMemo(
    () =>
      createTrackGeometry({
        innerRadius:
          track.innerCurveRadius -
          track.innerKerbWidth -
          track.drainChannelWidth,
        laneCount: 1,
        laneWidth: track.drainChannelWidth,
        straightLength: track.straightLength,
      }),
    [track],
  );

  useEffect(
    () => () => {
      trackGeometry.dispose();
      laneGeometries.forEach((geometry) => geometry.dispose());
      innerKerbGeometry.dispose();
      drainChannelGeometry.dispose();
    },
    [drainChannelGeometry, innerKerbGeometry, laneGeometries, trackGeometry],
  );

  return (
    <group name="athletics-track" position={[0, -0.01, 0]}>
      <mesh geometry={trackGeometry} receiveShadow>
        <meshStandardMaterial color="#a94f3e" roughness={0.88} />
      </mesh>
      {laneGeometries.map((geometry, laneIndex) => (
        <mesh key={laneIndex} geometry={geometry} position={[0, 0.025, 0]}>
          <meshBasicMaterial color="#f1d9c4" />
        </mesh>
      ))}
      <mesh geometry={innerKerbGeometry} position={[0, 0.045, 0]}>
        <meshStandardMaterial
          color="#e9e8df"
          metalness={0.08}
          roughness={0.72}
        />
      </mesh>
      <mesh geometry={drainChannelGeometry} position={[0, 0.032, 0]}>
        <meshStandardMaterial
          color="#6f7672"
          metalness={0.32}
          roughness={0.58}
        />
      </mesh>
    </group>
  );
}
