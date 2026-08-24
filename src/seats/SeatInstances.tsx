import { useEffect, useMemo } from 'react';
import { MeshLambertMaterial, MeshStandardMaterial } from 'three';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { useRenderQuality } from '../utils/useRenderQuality';
import { createSeatGeometry } from './createSeatGeometry';
import { radesSeatLayout } from './seatMetadata';
import { SeatPicker } from './SeatPicker';

export function SeatInstances() {
  const renderQuality = useRenderQuality();
  const geometry = useMemo(
    () => createSeatGeometry(radesStadiumConfig.seats, renderQuality),
    [renderQuality],
  );
  const material = useMemo(
    () =>
      renderQuality === 'low'
        ? new MeshLambertMaterial({ color: '#ffffff' })
        : new MeshStandardMaterial({
            color: '#ffffff',
            metalness: 0.05,
            roughness: 0.72,
          }),
    [renderQuality],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  return (
    <SeatPicker
      geometry={geometry}
      layout={radesSeatLayout}
      material={material}
    />
  );
}
