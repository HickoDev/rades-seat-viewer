import { useMemo } from 'react';
import { Object3D } from 'three';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { getStadiumPerimeterPoint } from '../stadium/geometry/stadiumPerimeter';
import { useSunPreview } from '../sunlight/useSunPreview';
import { useRenderQuality } from '../utils/useRenderQuality';

export function StadiumFloodlights() {
  const sunPreview = useSunPreview();
  const renderQuality = useRenderQuality();
  const target = useMemo(() => new Object3D(), []);
  const { roof } = radesStadiumConfig;
  const lightCount = renderQuality === 'high' ? 8 : 4;
  const placements = useMemo(
    () =>
      Array.from({ length: lightCount }, (_, index) => {
        const angle = (index / lightCount) * Math.PI * 2;
        const point = getStadiumPerimeterPoint(
          angle,
          roof.innerRadiusX + 1.5,
          roof.innerRadiusZ + 1.5,
        );
        return [
          point.x,
          roof.innerHeight - roof.innerTrussDepth - 0.8,
          point.z,
        ] as [number, number, number];
      }),
    [lightCount, roof],
  );

  if (!sunPreview || sunPreview.floodlightFactor <= 0.01) return null;

  return (
    <group name="automatic-stadium-floodlights">
      <primitive object={target} />
      {placements.map((position, index) => (
        <spotLight
          key={index}
          position={position}
          target={target}
          color="#e7f2ff"
          intensity={2600 * sunPreview.floodlightFactor}
          distance={310}
          decay={1.35}
          angle={0.74}
          penumbra={0.58}
          castShadow={false}
        />
      ))}
    </group>
  );
}
