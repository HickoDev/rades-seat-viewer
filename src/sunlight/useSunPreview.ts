import { useMemo } from 'react';

import { useStadiumStore } from '../state/useStadiumStore';
import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { calculateSunPosition } from './calculateSunPosition';
import { createSunDirection } from './createSunDirection';

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function useSunPreview() {
  const matchStartIso = useStadiumStore((state) => state.matchStartIso);
  const sunPreviewIso = useStadiumStore((state) => state.sunPreviewIso);
  const showSunSimulation = useStadiumStore((state) => state.showSunSimulation);
  const timestampIso = sunPreviewIso ?? matchStartIso;

  return useMemo(() => {
    if (!showSunSimulation || !timestampIso) return null;
    const { identity } = radesStadiumConfig;
    const position = calculateSunPosition(
      timestampIso,
      identity.latitude,
      identity.longitude,
      identity.timezone,
    );
    const altitudeDegrees = position.altitudeRadians * (180 / Math.PI);
    return {
      timestampIso,
      position,
      direction: createSunDirection(
        position.altitudeRadians,
        position.azimuthRadians,
        identity.northRotationDegrees,
      ),
      altitudeDegrees,
      daylightFactor: clamp((altitudeDegrees + 5) / 12, 0, 1),
      floodlightFactor: clamp((3 - altitudeDegrees) / 8, 0, 1),
      isNight: altitudeDegrees <= -6,
    };
  }, [showSunSimulation, timestampIso]);
}
