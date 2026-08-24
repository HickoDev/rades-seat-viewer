import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { useStadiumStore } from '../state/useStadiumStore';
import { useReducedMotion } from '../utils/useReducedMotion';
import { getOverviewCameraPose, getSectionCameraPose } from './cameraPoses';
import { flyCamera } from './cameraTransitions';

export function OverviewCamera() {
  const camera = useThree((state) => state.camera);
  const cameraMode = useStadiumStore((state) => state.cameraMode);
  const selectedSectionId = useStadiumStore((state) => state.selectedSectionId);
  const reducedMotion = useReducedMotion();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const currentTarget = useMemo(
    () => getOverviewCameraPose().target.clone(),
    [],
  );
  const siteRadius = radesStadiumConfig.roof.outerRadiusX;

  useEffect(() => {
    if (cameraMode === 'seat') return;
    const pose =
      cameraMode === 'section' && selectedSectionId
        ? getSectionCameraPose(selectedSectionId)
        : getOverviewCameraPose();
    const transition = flyCamera({
      camera,
      currentTarget,
      destinationPosition: pose.position,
      destinationTarget: pose.target,
      reducedMotion,
      onUpdate: () => controlsRef.current?.update(),
    });

    return () => {
      transition.kill();
    };
  }, [camera, cameraMode, currentTarget, reducedMotion, selectedSectionId]);

  if (cameraMode === 'seat') return null;

  return (
    <OrbitControls
      ref={controlsRef}
      autoRotate={cameraMode === 'overview' && !reducedMotion}
      autoRotateSpeed={0.35}
      dampingFactor={0.06}
      enableDamping
      enablePan={false}
      makeDefault
      maxDistance={cameraMode === 'overview' ? siteRadius * 4.3 : siteRadius}
      maxPolarAngle={Math.PI * 0.49}
      minDistance={cameraMode === 'overview' ? siteRadius * 1.18 : 10}
      minPolarAngle={Math.PI * 0.12}
      target={currentTarget}
    />
  );
}
