import type { ThreeEvent } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  Color,
  Matrix4,
  type BufferGeometry,
  type InstancedMesh,
  type MeshStandardMaterial,
} from 'three';

import { useStadiumStore } from '../state/useStadiumStore';
import type { SeatLayout } from './seat.types';

type SeatPickerProps = {
  geometry: BufferGeometry;
  layout: SeatLayout;
  material: MeshStandardMaterial;
};

const lowerSeatColor = new Color('#2978a8');
const upperSeatColor = new Color('#376f91');
const selectedSeatColor = new Color('#d9ff70');

export function SeatPicker({ geometry, layout, material }: SeatPickerProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const previousSelectedInstance = useRef<number | null>(null);
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
      mesh.setColorAt(
        instanceId,
        seat.tierId === 'lower' ? lowerSeatColor : upperSeatColor,
      );
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [layout]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const previousId = previousSelectedInstance.current;
    if (previousId !== null) {
      const previousSeat = layout.metadata[previousId];
      mesh.setColorAt(
        previousId,
        previousSeat.tierId === 'lower' ? lowerSeatColor : upperSeatColor,
      );
    }

    const key = `${selectedSectionId}:${selectedRow}:${selectedSeat}`;
    const nextId = instanceBySeatKey.get(key) ?? null;
    if (nextId !== null) {
      mesh.setColorAt(nextId, selectedSeatColor);
    }
    previousSelectedInstance.current = nextId;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [instanceBySeatKey, layout, selectedRow, selectedSeat, selectedSectionId]);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (event.instanceId === undefined) return;
    const seat = layout.metadata[event.instanceId];
    if (!seat) return;

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
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      receiveShadow={false}
    />
  );
}
