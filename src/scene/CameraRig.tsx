import { OrbitControls } from '@react-three/drei';
import { useEffect, useState } from 'react';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { useStadiumStore } from '../state/useStadiumStore';

export function CameraRig() {
  const cameraMode = useStadiumStore((state) => state.cameraMode);
  const siteRadius = radesStadiumConfig.roof.outerRadiusX;
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <OrbitControls
      autoRotate={cameraMode === 'overview' && !prefersReducedMotion}
      autoRotateSpeed={0.35}
      dampingFactor={0.06}
      enableDamping
      enablePan={false}
      maxDistance={siteRadius * 2.4}
      maxPolarAngle={Math.PI * 0.49}
      minDistance={siteRadius * 0.72}
      minPolarAngle={Math.PI * 0.12}
      target={[0, radesStadiumConfig.roof.innerHeight * 0.25, 0]}
    />
  );
}
