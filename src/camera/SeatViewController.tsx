import { useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { MathUtils, Vector3 } from 'three';

import { findViewingPosition } from '../seats/viewingPositions';
import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { useStadiumStore } from '../state/useStadiumStore';
import { useReducedMotion } from '../utils/useReducedMotion';
import { calculateSeatView } from './calculateSeatView';
import { flyCamera } from './cameraTransitions';

export function SeatViewController() {
  const camera = useThree((state) => state.camera);
  const domElement = useThree((state) => state.gl.domElement);
  const cameraMode = useStadiumStore((state) => state.cameraMode);
  const sectionId = useStadiumStore((state) => state.selectedSectionId);
  const row = useStadiumStore((state) => state.selectedRow);
  const seatNumber = useStadiumStore((state) => state.selectedSeat);
  const viewKind = useStadiumStore((state) => state.selectedViewKind);
  const reducedMotion = useReducedMotion();
  const currentTarget = useMemo(() => new Vector3(), []);
  const isReady = useRef(false);
  const view = useMemo(() => {
    const position = findViewingPosition(sectionId, row, seatNumber, viewKind);
    return position
      ? calculateSeatView(position.metadata, radesStadiumConfig.seats.eyeHeight)
      : null;
  }, [row, seatNumber, sectionId, viewKind]);

  useEffect(() => {
    if (cameraMode !== 'seat' || !view) return;
    isReady.current = false;
    currentTarget.copy(view.pitchTarget);
    const transition = flyCamera({
      camera,
      currentTarget,
      destinationPosition: view.eyePosition,
      destinationTarget: view.pitchTarget,
      reducedMotion,
      onComplete: () => {
        isReady.current = true;
      },
    });

    return () => {
      transition.kill();
    };
  }, [camera, cameraMode, currentTarget, reducedMotion, view]);

  useEffect(() => {
    if (cameraMode !== 'seat' || !view) return;
    let activePointerId: number | null = null;
    let previousX = 0;
    let previousY = 0;
    let yawOffset = 0;
    let pitchOffset = 0;
    const up = new Vector3(0, 1, 0);

    const applyLook = () => {
      const direction = view.viewingDirection
        .clone()
        .applyAxisAngle(up, yawOffset);
      const right = direction.clone().cross(up).normalize();
      direction.applyAxisAngle(right, pitchOffset).normalize();
      camera.position.copy(view.eyePosition);
      camera.lookAt(view.eyePosition.clone().add(direction));
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!isReady.current) return;
      activePointerId = event.pointerId;
      previousX = event.clientX;
      previousY = event.clientY;
      domElement.setPointerCapture(event.pointerId);
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (activePointerId !== event.pointerId) return;
      const deltaX = event.clientX - previousX;
      const deltaY = event.clientY - previousY;
      previousX = event.clientX;
      previousY = event.clientY;
      yawOffset = MathUtils.clamp(
        yawOffset - deltaX * 0.004,
        MathUtils.degToRad(-35),
        MathUtils.degToRad(35),
      );
      pitchOffset = MathUtils.clamp(
        pitchOffset - deltaY * 0.003,
        MathUtils.degToRad(-18),
        MathUtils.degToRad(25),
      );
      applyLook();
    };
    const handlePointerUp = (event: PointerEvent) => {
      if (activePointerId !== event.pointerId) return;
      activePointerId = null;
      domElement.releasePointerCapture(event.pointerId);
    };

    domElement.addEventListener('pointerdown', handlePointerDown);
    domElement.addEventListener('pointermove', handlePointerMove);
    domElement.addEventListener('pointerup', handlePointerUp);
    domElement.addEventListener('pointercancel', handlePointerUp);

    return () => {
      domElement.removeEventListener('pointerdown', handlePointerDown);
      domElement.removeEventListener('pointermove', handlePointerMove);
      domElement.removeEventListener('pointerup', handlePointerUp);
      domElement.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [camera, cameraMode, domElement, view]);

  return null;
}
