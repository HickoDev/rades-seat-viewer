import { DoubleSide } from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { ExteriorBracing } from './ExteriorBracing';
import { ExteriorMosaicBand } from './ExteriorMosaicBand';
import { MainEntranceFacade } from './MainEntranceFacade';

export function Facade() {
  const { roof, structure } = radesStadiumConfig;
  const radiusX = roof.outerRadiusX + structure.exteriorRadiusOffset * 0.7;
  const radiusZ = roof.outerRadiusZ + structure.exteriorRadiusOffset * 0.7;

  return (
    <group name="rades-exterior-facade">
      <mesh
        position={[
          0,
          structure.exteriorBandBottomHeight + structure.exteriorBandHeight / 2,
          0,
        ]}
        scale={[radiusX, structure.exteriorBandHeight, radiusZ]}
      >
        <cylinderGeometry args={[1, 1, 1, structure.frameCount * 2, 1, true]} />
        <meshStandardMaterial
          color="#d8c985"
          roughness={0.76}
          side={DoubleSide}
        />
      </mesh>
      {[
        structure.exteriorBandBottomHeight,
        structure.exteriorBandBottomHeight + structure.exteriorBandHeight,
      ].map((height) => (
        <mesh
          key={height}
          position={[0, height, 0]}
          scale={[radiusX + 0.22, 0.36, radiusZ + 0.22]}
        >
          <cylinderGeometry
            args={[1, 1, 1, structure.frameCount * 2, 1, true]}
          />
          <meshStandardMaterial
            color="#2474a2"
            roughness={0.68}
            side={DoubleSide}
          />
        </mesh>
      ))}
      <ExteriorMosaicBand />
      <ExteriorBracing />
      <MainEntranceFacade />
    </group>
  );
}
