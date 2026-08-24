import { useEffect, useMemo } from 'react';
import { MeshStandardMaterial } from 'three';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { createSeatGeometry } from './createSeatGeometry';
import { radesSeatLayout } from './seatMetadata';
import { SeatPicker } from './SeatPicker';

export function SeatInstances() {
  const geometry = useMemo(
    () => createSeatGeometry(radesStadiumConfig.seats),
    [],
  );
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#ffffff',
        metalness: 0.05,
        roughness: 0.72,
      }),
    [],
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
