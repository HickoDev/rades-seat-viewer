import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';

export function SceneLighting() {
  const lightDistance = radesStadiumConfig.roof.outerRadiusX * 0.75;

  return (
    <>
      <hemisphereLight args={['#dff8ed', '#101b18', 1.35]} />
      <directionalLight
        color="#fff2d3"
        intensity={2.4}
        position={[lightDistance, lightDistance, lightDistance * 0.4]}
      />
    </>
  );
}
