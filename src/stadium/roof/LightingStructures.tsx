import { radesStadiumConfig } from '../config/radesStadiumConfig';

export function LightingStructures() {
  const { roof, structure } = radesStadiumConfig;

  return (
    <group name="lighting-structures">
      {Array.from({ length: structure.lightingMastCount }, (_, mastIndex) => {
        const angle =
          (mastIndex / structure.lightingMastCount) * Math.PI * 2 + Math.PI / 4;
        const x =
          Math.cos(angle) *
          (roof.outerRadiusX + structure.exteriorRadiusOffset * 1.4);
        const z =
          Math.sin(angle) *
          (roof.outerRadiusZ + structure.exteriorRadiusOffset * 1.4);

        return (
          <group key={mastIndex} position={[x, 0, z]} rotation={[0, -angle, 0]}>
            <mesh
              position={[0, structure.lightingMastHeight / 2, 0]}
              userData={{ shadowOccluder: true, occluderType: 'lighting-mast' }}
            >
              <cylinderGeometry
                args={[0.28, 0.48, structure.lightingMastHeight, 10]}
              />
              <meshStandardMaterial color="#7d8983" metalness={0.45} />
            </mesh>
            <mesh position={[0, structure.lightingMastHeight, -1.2]}>
              <boxGeometry args={[5.5, 2.1, 0.5]} />
              <meshStandardMaterial
                color="#dfe7d8"
                emissive="#e8ffcf"
                emissiveIntensity={0.18}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
