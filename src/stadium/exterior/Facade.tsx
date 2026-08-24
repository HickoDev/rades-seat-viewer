import { DoubleSide } from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { ExteriorBracing } from './ExteriorBracing';
import { MainEntranceFacade } from './MainEntranceFacade';

export function Facade() {
  const { roof, structure } = radesStadiumConfig;
  const radiusX = roof.outerRadiusX + structure.exteriorRadiusOffset * 0.7;
  const radiusZ = roof.outerRadiusZ + structure.exteriorRadiusOffset * 0.7;

  return (
    <group name="rades-exterior-facade">
      {[structure.facadeHeight * 0.54, structure.facadeHeight * 0.66].map(
        (height, index) => (
          <mesh
            key={height}
            position={[0, height, 0]}
            scale={[radiusX + 0.2, 0.52, radiusZ + 0.2]}
          >
            <cylinderGeometry
              args={[1, 1, 1, structure.frameCount * 2, 1, true]}
            />
            <meshStandardMaterial
              color={index === 0 ? '#d8b43f' : '#1d6da1'}
              roughness={0.68}
              side={DoubleSide}
            />
          </mesh>
        ),
      )}
      <ExteriorBracing />
      <MainEntranceFacade />
    </group>
  );
}
