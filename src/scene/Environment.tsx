import { Grid } from '@react-three/drei';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';

export function Environment() {
  const siteDiameter = radesStadiumConfig.roof.outerRadiusX * 2.8;

  return (
    <>
      <color attach="background" args={['#07130f']} />
      <fog attach="fog" args={['#07130f', siteDiameter * 0.55, siteDiameter]} />
      <Grid
        args={[siteDiameter, siteDiameter]}
        cellColor="#24473a"
        cellSize={5}
        cellThickness={0.45}
        fadeDistance={siteDiameter * 0.48}
        fadeStrength={1.5}
        infiniteGrid
        position={[0, -0.02, 0]}
        sectionColor="#4a826e"
        sectionSize={25}
        sectionThickness={0.8}
      />
    </>
  );
}
