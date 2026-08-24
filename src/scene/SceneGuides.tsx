import { useMemo } from 'react';
import { Vector3 } from 'three';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { useStadiumStore } from '../state/useStadiumStore';

export function SceneGuides() {
  const showDebugGuides = useStadiumStore((state) => state.showDebugGuides);
  const northDirection = useMemo(() => {
    const rotation =
      (radesStadiumConfig.identity.northRotationDegrees * Math.PI) / 180;
    return new Vector3(Math.sin(rotation), 0, Math.cos(rotation)).normalize();
  }, []);
  const guideLength = radesStadiumConfig.pitch.width * 0.2;
  const origin = useMemo(
    () =>
      new Vector3(
        -radesStadiumConfig.pitch.length / 2,
        0.15,
        -radesStadiumConfig.pitch.width / 2 - 5,
      ),
    [],
  );

  return (
    <group name="scene-guides">
      <arrowHelper
        args={[
          northDirection,
          origin,
          guideLength,
          '#c5f268',
          guideLength * 0.22,
          guideLength * 0.12,
        ]}
      />
      {showDebugGuides && (
        <axesHelper
          args={[radesStadiumConfig.pitch.width * 0.35]}
          position={[0, 0.12, 0]}
        />
      )}
    </group>
  );
}
