import { useMemo } from 'react';

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
    </group>
  );
}
