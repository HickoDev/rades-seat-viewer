import { Sky } from '@react-three/drei';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';

export function Environment() {
  const siteDiameter = radesStadiumConfig.roof.outerRadiusX * 2.8;

  return (
    <>
      <color attach="background" args={['#a8c9d9']} />
      <fog
        attach="fog"
        args={['#b7ced5', siteDiameter * 1.2, siteDiameter * 2.35]}
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
      <mesh position={[0, -4, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[siteDiameter * 12, siteDiameter * 12]} />
        <meshStandardMaterial color="#7d8b73" roughness={1} />
      </mesh>
    </>
  );
}
