import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { ACESFilmicToneMapping, PCFShadowMap, SRGBColorSpace } from 'three';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { RadesStadium } from '../stadium/RadesStadium';
import { useStadiumStore } from '../state/useStadiumStore';
import { useRenderQuality } from '../utils/useRenderQuality';
import { useReducedMotion } from '../utils/useReducedMotion';
import { LoadingScreen } from '../ui/LoadingScreen';
import { CurrentExposureBadge } from '../ui/CurrentExposureBadge';
import { CameraRig } from './CameraRig';
import { Environment } from './Environment';
import { PerformanceMonitor } from './PerformanceMonitor';
import { SceneLighting } from './SceneLighting';
import { SceneGuides } from './SceneGuides';
import { StadiumFloodlights } from './StadiumFloodlights';
import { SunSimulation } from './SunSimulation';

export function StadiumCanvas() {
  const siteRadius = radesStadiumConfig.roof.outerRadiusX;
  const cameraMode = useStadiumStore((state) => state.cameraMode);
  const renderQuality = useRenderQuality();
  const prefersReducedMotion = useReducedMotion();
  const instructions =
    cameraMode === 'seat'
      ? 'Drag to look · Escape to return'
      : cameraMode === 'section'
        ? 'Section focus · Choose a row and seat'
        : 'Drag to orbit · Scroll to zoom';

  return (
    <section className="stadium-viewport" aria-label="Interactive stadium view">
      <Canvas
        key={renderQuality}
        frameloop={prefersReducedMotion ? 'demand' : 'always'}
        camera={{
          far: siteRadius * 6,
          fov: 42,
          near: 0.5,
          position: [siteRadius * 1.2, siteRadius * 1.55, siteRadius * 3.25],
        }}
        dpr={renderQuality === 'low' ? [0.75, 1] : [1, 1.75]}
        shadows={renderQuality === 'high'}
        fallback={
          <LoadingScreen message="WebGL is required to display the stadium view." />
        }
        gl={{
          antialias: renderQuality === 'high',
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.outputColorSpace = SRGBColorSpace;
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          gl.shadowMap.type = PCFShadowMap;
        }}
      >
        <Suspense fallback={null}>
          <SceneLighting />
          <Environment />
          <StadiumFloodlights />
          <RadesStadium />
          <SceneGuides />
          <SunSimulation />
        </Suspense>
        <CameraRig />
        <PerformanceMonitor />
      </Canvas>

      <CurrentExposureBadge />

      <div className="viewport-hud" aria-hidden="true">
        <span className="viewport-hud__eyebrow">{renderQuality} quality</span>
        <span>{instructions}</span>
      </div>

      <div
        className="north-indicator"
        aria-label="Scene north aligned from open map geometry"
      >
        <span>N</span>
        <small>map aligned</small>
      </div>
    </section>
  );
}
