import { Grid, Sky } from '@react-three/drei';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';

export function Environment() {
  const siteDiameter = radesStadiumConfig.roof.outerRadiusX * 2.8;

  return (
    <>
      <color attach="background" args={['#a8c9d9']} />
      <fog
        attach="fog"
        args={['#b7ced5', siteDiameter * 0.7, siteDiameter * 1.25]}
      />
      <Sky
        distance={siteDiameter * 4}
        inclination={0.48}
        mieCoefficient={0.004}
        mieDirectionalG={0.78}
        rayleigh={1.15}
        sunPosition={[siteDiameter, siteDiameter * 0.62, siteDiameter * 0.28]}
        turbidity={3.2}
      />
      <Grid
        args={[siteDiameter, siteDiameter]}
        cellColor="#839591"
        cellSize={5}
        cellThickness={0.45}
        fadeDistance={siteDiameter * 0.48}
        fadeStrength={1.5}
        infiniteGrid
        position={[0, -0.02, 0]}
        sectionColor="#a8b5ae"
        sectionSize={25}
        sectionThickness={0.8}
      />
    </>
  );
}
