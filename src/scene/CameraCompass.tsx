import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, type RefObject } from 'react';
import { Vector3 } from 'three';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';

const worldUp = new Vector3(0, 1, 0);

export function CameraCompass({
  indicatorRef,
}: {
  indicatorRef: RefObject<HTMLDivElement | null>;
}) {
  const forward = useRef(new Vector3());
  const right = useRef(new Vector3());
  const north = useMemo(() => {
    const rotation =
      (radesStadiumConfig.identity.northRotationDegrees * Math.PI) / 180;
    return new Vector3(Math.sin(rotation), 0, Math.cos(rotation)).normalize();
  }, []);

  useFrame(({ camera }) => {
    const element = indicatorRef.current;
    if (!element) return;
    camera.getWorldDirection(forward.current);
    forward.current.y = 0;
    if (forward.current.lengthSq() < 0.0001) return;
    forward.current.normalize();
    right.current.crossVectors(worldUp, forward.current).normalize();
    const angle = Math.atan2(
      north.dot(right.current),
      north.dot(forward.current),
    );
    element.style.setProperty('--north-rotation', `${angle}rad`);
  });

  return null;
}
