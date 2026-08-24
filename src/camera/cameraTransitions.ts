import { gsap } from 'gsap';
import type { Camera, Vector3 } from 'three';

export type CameraTransitionOptions = {
  camera: Camera;
  currentTarget: Vector3;
  destinationPosition: Vector3;
  destinationTarget: Vector3;
  reducedMotion: boolean;
  onUpdate?: () => void;
  onComplete?: () => void;
};

export function flyCamera({
  camera,
  currentTarget,
  destinationPosition,
  destinationTarget,
  onComplete,
  onUpdate,
  reducedMotion,
}: CameraTransitionOptions) {
  const duration = reducedMotion ? 0.01 : 1.35;
  const timeline = gsap.timeline({
    defaults: { duration, ease: 'power3.inOut' },
    onComplete,
    onUpdate: () => {
      camera.lookAt(currentTarget);
      onUpdate?.();
    },
  });

  timeline.to(
    camera.position,
    {
      x: destinationPosition.x,
      y: destinationPosition.y,
      z: destinationPosition.z,
    },
    0,
  );
  timeline.to(
    currentTarget,
    {
      x: destinationTarget.x,
      y: destinationTarget.y,
      z: destinationTarget.z,
    },
    0,
  );

  return timeline;
}
