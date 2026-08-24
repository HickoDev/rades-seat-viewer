import { DoubleSide } from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';

export function Facade() {
  const { roof, structure } = radesStadiumConfig;

  return (
    <mesh
      name="perforated-facade"
      position={[0, structure.facadeHeight / 2, 0]}
      scale={[
        roof.outerRadiusX + structure.exteriorRadiusOffset * 0.7,
        structure.facadeHeight,
        roof.outerRadiusZ + structure.exteriorRadiusOffset * 0.7,
      ]}
    >
      <cylinderGeometry args={[1, 1, 1, structure.frameCount, 1, true]} />
      <meshStandardMaterial
        color="#31483f"
        opacity={0.28}
        roughness={0.9}
        side={DoubleSide}
        transparent
        wireframe
      />
    </mesh>
  );
}
