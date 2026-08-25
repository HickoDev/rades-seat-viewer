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
        <meshStandardMaterial color="#245d3c" roughness={0.92} />
      </mesh>

      {Array.from({ length: pitch.mowingStripeCount }, (_, index) => (
        <mesh
          key={index}
          position={[-pitch.length / 2 + stripeWidth * (index + 0.5), 0.061, 0]}
        >
          <boxGeometry args={[stripeWidth, 0.01, pitch.width]} />
          <meshBasicMaterial
            color={index % 2 === 0 ? '#2f7049' : '#286542'}
            polygonOffset
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
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
