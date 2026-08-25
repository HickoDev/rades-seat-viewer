import { useEffect, useRef } from 'react';
import type { Object3D } from 'three';

import { calculateSeatView } from '../camera/calculateSeatView';
import { findViewingPosition } from '../seats/viewingPositions';
import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { useStadiumStore } from '../state/useStadiumStore';
import {
  createStadiumSunOccluders,
  disposeStadiumSunOccluders,
} from '../sunlight/createStadiumSunOccluders';
import { simulateMatchExposure } from '../sunlight/simulateMatchExposure';

export function SunSimulation() {
  const occludersRef = useRef<Object3D[] | null>(null);
  const selectedSectionId = useStadiumStore((state) => state.selectedSectionId);
  const selectedRow = useStadiumStore((state) => state.selectedRow);
  const selectedSeat = useStadiumStore((state) => state.selectedSeat);
  const selectedViewKind = useStadiumStore((state) => state.selectedViewKind);
  const matchStartIso = useStadiumStore((state) => state.matchStartIso);
  const matchEndIso = useStadiumStore((state) => state.matchEndIso);
  const showSunSimulation = useStadiumStore((state) => state.showSunSimulation);
  const setSunExposureResult = useStadiumStore(
    (state) => state.setSunExposureResult,
  );
  useEffect(
    () => () => {
      if (occludersRef.current) {
        disposeStadiumSunOccluders(occludersRef.current);
        occludersRef.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    const position = findViewingPosition(
      selectedSectionId,
      selectedRow,
      selectedSeat,
      selectedViewKind,
    );
    if (!showSunSimulation || !position || !matchStartIso || !matchEndIso) {
      setSunExposureResult(null);
      return;
    }

    const occluders =
      occludersRef.current ??
      (occludersRef.current = createStadiumSunOccluders());
    const view = calculateSeatView(
      position.metadata,
      radesStadiumConfig.seats.eyeHeight,
    );
    setSunExposureResult(
      simulateMatchExposure({
        matchStartIso,
        matchEndIso,
        timezone: radesStadiumConfig.identity.timezone,
        latitude: radesStadiumConfig.identity.latitude,
        longitude: radesStadiumConfig.identity.longitude,
        northRotationDegrees: radesStadiumConfig.identity.northRotationDegrees,
        eyePosition: view.eyePosition,
        viewingDirection: view.viewingDirection,
        occluders,
      }),
    );
  }, [
    matchEndIso,
    matchStartIso,
    selectedRow,
    selectedSeat,
    selectedSectionId,
    selectedViewKind,
    setSunExposureResult,
    showSunSimulation,
  ]);

  return null;
}
