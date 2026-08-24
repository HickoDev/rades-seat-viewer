import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';

export function SceneLighting() {
  const lightDistance = radesStadiumConfig.roof.outerRadiusX * 0.75;

  return (
    <>
      <hemisphereLight args={['#e6f4ff', '#756d60', 1.05]} />
      <directionalLight
        color="#fff2d3"
        intensity={1.85}
        position={[lightDistance, lightDistance, lightDistance * 0.4]}
      />
    </>
  );
}
