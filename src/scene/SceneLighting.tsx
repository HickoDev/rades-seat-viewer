import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { useSunPreview } from '../sunlight/useSunPreview';
import { useRenderQuality } from '../utils/useRenderQuality';
import { calculateDaylightLightingLevels } from './calculateDaylightLightingLevels';

export function SceneLighting() {
  const lightDistance = radesStadiumConfig.roof.outerRadiusX * 0.75;
  const renderQuality = useRenderQuality();
  const sunPreview = useSunPreview();
  const daylightFactor = sunPreview?.daylightFactor ?? 1;
  const lighting = calculateDaylightLightingLevels(
    daylightFactor,
    sunPreview?.isNight ?? false,
  );
  const direction = sunPreview?.direction;
  const showDirectionalSun =
    !sunPreview || sunPreview.position.altitudeRadians > 0;
  const position: [number, number, number] = direction
    ? [
        direction.x * lightDistance * 4,
        direction.y * lightDistance * 4,
        direction.z * lightDistance * 4,
      ]
    : [lightDistance, lightDistance, lightDistance * 0.4];

  return (
    <>
      <hemisphereLight
        args={[
          sunPreview?.isNight ? '#152442' : '#eaf7ff',
          sunPreview?.isNight ? '#111714' : '#918d80',
          lighting.hemisphereIntensity,
        ]}
      />
      <ambientLight intensity={lighting.ambientIntensity} />
      {showDirectionalSun && (
        <directionalLight
          castShadow={renderQuality === 'high'}
          color={
            sunPreview && sunPreview.altitudeDegrees < 10
              ? '#ffd09a'
              : '#fff9ed'
          }
          intensity={lighting.directionalIntensity}
          position={position}
          shadow-bias={-0.00018}
          shadow-normalBias={0.035}
          shadow-radius={2}
          shadow-mapSize-width={renderQuality === 'high' ? 2048 : 512}
          shadow-mapSize-height={renderQuality === 'high' ? 2048 : 512}
          shadow-camera-near={1}
          shadow-camera-far={lightDistance * 12}
          shadow-camera-left={-lightDistance * 1.75}
          shadow-camera-right={lightDistance * 1.75}
          shadow-camera-top={lightDistance * 1.45}
          shadow-camera-bottom={-lightDistance * 1.45}
        />
      )}
    </>
  );
}
