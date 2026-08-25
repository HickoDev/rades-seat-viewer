import { Sky, Stars } from '@react-three/drei';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { useSunPreview } from '../sunlight/useSunPreview';

export function Environment() {
  const siteDiameter = radesStadiumConfig.roof.outerRadiusX * 2.8;
  const sunPreview = useSunPreview();
  const sunDistance = siteDiameter * 3;
  const sunPosition: [number, number, number] = sunPreview
    ? [
        sunPreview.direction.x * sunDistance,
        sunPreview.direction.y * sunDistance,
        sunPreview.direction.z * sunDistance,
      ]
    : [siteDiameter, siteDiameter * 0.62, siteDiameter * 0.28];
  const background = !sunPreview
    ? '#a8c9d9'
    : sunPreview.isNight
      ? '#030814'
      : sunPreview.altitudeDegrees <= 0
        ? '#182844'
        : sunPreview.altitudeDegrees < 8
          ? '#d98262'
          : '#83b9d5';
  const fogColor = sunPreview?.isNight ? '#07101f' : background;

  return (
    <>
      <color attach="background" args={[background]} />
      <fog
        attach="fog"
        args={[fogColor, siteDiameter * 1.2, siteDiameter * 2.35]}
      />
      {!sunPreview?.isNight && (
        <Sky
          distance={siteDiameter * 4}
          mieCoefficient={0.004}
          mieDirectionalG={0.78}
          rayleigh={sunPreview ? 0.72 + sunPreview.daylightFactor * 0.7 : 1.15}
          sunPosition={sunPosition}
          turbidity={sunPreview && sunPreview.altitudeDegrees < 8 ? 7 : 3.2}
        />
      )}
      {sunPreview?.isNight && (
        <Stars
          radius={siteDiameter * 1.6}
          depth={siteDiameter}
          count={2200}
          factor={3.4}
          saturation={0.14}
          fade
          speed={0}
        />
      )}
      {sunPreview && sunPreview.position.altitudeRadians > 0 && (
        <mesh position={sunPosition} name="astronomical-sun-disc">
          <sphereGeometry args={[sunDistance * 0.006, 24, 16]} />
          <meshBasicMaterial
            color={sunPreview.altitudeDegrees < 8 ? '#ffb46b' : '#fff5c2'}
            toneMapped={false}
          />
        </mesh>
      )}
      <mesh position={[0, -4, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[siteDiameter * 12, siteDiameter * 12]} />
        <meshStandardMaterial
          color={sunPreview?.isNight ? '#17221c' : '#7d8b73'}
          roughness={1}
        />
      </mesh>
    </>
  );
}
