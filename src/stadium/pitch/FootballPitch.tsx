import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { AdvertisingBoards } from './AdvertisingBoards';
import { Benches } from './Benches';
import { Goals } from './Goals';
import { PitchMarkings } from './PitchMarkings';

export function FootballPitch() {
  const pitch = radesStadiumConfig.pitch;
  const stripeWidth = pitch.length / pitch.mowingStripeCount;

  return (
    <group name="football-pitch">
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[pitch.length, 0.1, pitch.width]} />
        <meshStandardMaterial color="#246f43" roughness={0.92} />
      </mesh>

      {Array.from({ length: pitch.mowingStripeCount }, (_, index) => (
        <mesh
          key={index}
          position={[-pitch.length / 2 + stripeWidth * (index + 0.5), 0.061, 0]}
          receiveShadow
        >
          <boxGeometry args={[stripeWidth, 0.01, pitch.width]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? '#338653' : '#287647'}
            polygonOffset
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
            roughness={0.94}
          />
        </mesh>
      ))}

      <PitchMarkings />
      <Goals />
      <Benches />
      <AdvertisingBoards />
    </group>
  );
}
