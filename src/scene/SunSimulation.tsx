import { useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import type { Object3D } from 'three';

import { calculateSeatView } from '../camera/calculateSeatView';
import { findSeat } from '../seats/seatMetadata';
import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { useStadiumStore } from '../state/useStadiumStore';
import { calculateSunPosition } from '../sunlight/calculateSunPosition';
import { createSunDirection } from '../sunlight/createSunDirection';
import { simulateMatchExposure } from '../sunlight/simulateMatchExposure';

export function SunSimulation() {
  const scene = useThree((state) => state.scene);
  const selectedSectionId = useStadiumStore((state) => state.selectedSectionId);
  const selectedRow = useStadiumStore((state) => state.selectedRow);
  const selectedSeat = useStadiumStore((state) => state.selectedSeat);
  const matchStartIso = useStadiumStore((state) => state.matchStartIso);
  const matchEndIso = useStadiumStore((state) => state.matchEndIso);
  const showSunSimulation = useStadiumStore((state) => state.showSunSimulation);
  const setSunExposureResult = useStadiumStore(
    (state) => state.setSunExposureResult,
  );
  const kickoffSun = useMemo(() => {
    if (!matchStartIso || !showSunSimulation) return null;
    return calculateSunPosition(
      matchStartIso,
      radesStadiumConfig.identity.latitude,
      radesStadiumConfig.identity.longitude,
      radesStadiumConfig.identity.timezone,
    );
  }, [matchStartIso, showSunSimulation]);
  const sunDirection = useMemo(
    () =>
      kickoffSun
        ? createSunDirection(
            kickoffSun.altitudeRadians,
            kickoffSun.azimuthRadians,
            radesStadiumConfig.identity.northRotationDegrees,
          )
        : null,
    [kickoffSun],
  );

  useEffect(() => {
    const seat = findSeat(selectedSectionId, selectedRow, selectedSeat);
    if (!showSunSimulation || !seat || !matchStartIso || !matchEndIso) {
      setSunExposureResult(null);
      return;
    }

    const occluders: Object3D[] = [];
    scene.updateMatrixWorld(true);
    scene.traverse((object) => {
      if (object.userData.shadowOccluder === true) occluders.push(object);
    });
    const view = calculateSeatView(seat, radesStadiumConfig.seats.eyeHeight);
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
    scene,
    selectedRow,
    selectedSeat,
    selectedSectionId,
    setSunExposureResult,
    showSunSimulation,
  ]);

  if (!sunDirection || !kickoffSun || kickoffSun.altitudeRadians <= 0) {
    return null;
  }
  const lightDistance = radesStadiumConfig.roof.outerRadiusX * 4;
  return (
    <directionalLight
      color="#fff1c9"
      intensity={2.8}
      position={[
        sunDirection.x * lightDistance,
        sunDirection.y * lightDistance,
        sunDirection.z * lightDistance,
      ]}
    />
  );
}
