import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';

export function SceneLighting() {
  const lightDistance = radesStadiumConfig.roof.outerRadiusX * 0.75;

  return (
    <>
      <hemisphereLight args={['#eaf7ff', '#6f776d', 1.08]} />
      <directionalLight
        color="#fff9ed"
        intensity={1.62}
        position={[lightDistance, lightDistance, lightDistance * 0.4]}
      />
    </>
  );
}
