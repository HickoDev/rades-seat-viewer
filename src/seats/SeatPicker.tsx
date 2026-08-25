import type { ThreeEvent } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  Color,
  Matrix4,
  type BufferGeometry,
  type InstancedMesh,
  type Material,
} from 'three';

import { useStadiumStore } from '../state/useStadiumStore';
import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { useRenderQuality } from '../utils/useRenderQuality';
import { isVisitorClosedSection } from './viewingPositions';
import type { SeatLayout } from './seat.types';

type SeatPickerProps = {
  geometry: BufferGeometry;
  layout: SeatLayout;
  material: Material;
};

const lowerSeatColor = new Color(radesStadiumConfig.seats.lowerPrimaryColor);
const lowerAccentColor = new Color(radesStadiumConfig.seats.lowerAccentColor);
const upperSeatColor = new Color(radesStadiumConfig.seats.upperPrimaryColor);
const upperAccentColor = new Color(radesStadiumConfig.seats.upperAccentColor);
const vipSeatColor = new Color(radesStadiumConfig.seats.vipColor);
const selectedSeatColor = new Color('#dbeafe');

function getDefaultSeatColor(seat: SeatLayout['metadata'][number]): Color {
  const sectionNumber = Number(seat.sectionId.split('-').at(-1)) || 1;
  const sectionIndex = sectionNumber - 1;
  if (
    seat.tierId === 'lower' &&
    radesStadiumConfig.grandstand.vipSectionIndices.includes(sectionIndex)
  ) {
    return vipSeatColor;
  }
  const sectionBand = Math.floor(
    (sectionNumber - 1) / radesStadiumConfig.seats.colorSectionBandSize,
  );
  const rowBand = Math.floor(
    (seat.rowNumber - 1) / radesStadiumConfig.seats.accentRowInterval,
  );
  const accented = (sectionBand + rowBand) % 2 === 0;
  if (seat.tierId === 'lower') {
    return accented ? lowerAccentColor : lowerSeatColor;
  }
  return accented ? upperAccentColor : upperSeatColor;
}

export function SeatPicker({ geometry, layout, material }: SeatPickerProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const renderQuality = useRenderQuality();
  const selectedSectionId = useStadiumStore((state) => state.selectedSectionId);
  const selectedRow = useStadiumStore((state) => state.selectedRow);
  const selectedSeat = useStadiumStore((state) => state.selectedSeat);
  const selectSection = useStadiumStore((state) => state.selectSection);
  const selectSeat = useStadiumStore((state) => state.selectSeat);
  const instanceBySeatKey = useMemo(() => {
    const index = new Map<string, number>();
    layout.metadata.forEach((seat, instanceId) => {
      index.set(
        `${seat.sectionId}:${seat.rowNumber}:${seat.seatNumber}`,
        instanceId,
      );
    });
    return index;
  }, [layout]);
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const matrix = new Matrix4();
    layout.metadata.forEach((seat, instanceId) => {
      matrix.fromArray(layout.matrices, instanceId * 16);
      mesh.setMatrixAt(instanceId, matrix);
      mesh.setColorAt(instanceId, getDefaultSeatColor(seat));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [layout]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    layout.metadata.forEach((seat, instanceId) => {
      mesh.setColorAt(instanceId, getDefaultSeatColor(seat));
    });

    const key = `${selectedSectionId}:${selectedRow}:${selectedSeat}`;
    const nextId = instanceBySeatKey.get(key) ?? null;
    if (nextId !== null) {
      mesh.setColorAt(nextId, selectedSeatColor);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [instanceBySeatKey, layout, selectedRow, selectedSeat, selectedSectionId]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (event.instanceId === undefined) return;
    const seat = layout.metadata[event.instanceId];
    if (!seat || isVisitorClosedSection(seat.sectionId)) return;

    event.stopPropagation();
    selectSection(seat.sectionId);
    selectSeat(seat.rowNumber, seat.seatNumber);
  };

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, layout.metadata.length]}
      castShadow={false}
      name="stadium-seats"
      onClick={handleClick}
      onPointerOut={() => {
        document.body.style.cursor = '';
      }}
      onPointerOver={(event) => {
        const seat =
          event.instanceId === undefined
            ? null
            : layout.metadata[event.instanceId];
        document.body.style.cursor =
          seat && !isVisitorClosedSection(seat.sectionId) ? 'pointer' : '';
      }}
      receiveShadow={renderQuality === 'high'}
    />
  );
}
