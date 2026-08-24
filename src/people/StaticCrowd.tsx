import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  Color,
  Matrix4,
  MeshLambertMaterial,
  MeshStandardMaterial,
  Vector3,
  type InstancedMesh,
} from 'three';

import { useStadiumStore } from '../state/useStadiumStore';
import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { useRenderQuality } from '../utils/useRenderQuality';
import { generateCrowdMembers, radesCrowdPlacementLayout } from './crowdLayout';
import {
  createPersonBodyGeometry,
  createPersonHeadGeometry,
} from './createPersonGeometry';

const clothingColors = [
  new Color('#c71f37'),
  new Color('#f2eee6'),
  new Color('#17233c'),
  new Color('#28658b'),
  new Color('#cd7b33'),
  new Color('#48765b'),
  new Color('#8f3f57'),
];
const skinColors = [
  new Color('#f0c7a5'),
  new Color('#dba47b'),
  new Color('#bb7954'),
  new Color('#8b5439'),
  new Color('#623c2c'),
];
const hiddenScale = new Vector3(0, 0, 0);
const ignoreRaycast = () => undefined;

export function StaticCrowd() {
  const bodyRef = useRef<InstancedMesh>(null);
  const headRef = useRef<InstancedMesh>(null);
  const hiddenInstanceRef = useRef<number | null>(null);
  const renderQuality = useRenderQuality();
  const cameraMode = useStadiumStore((state) => state.cameraMode);
  const selectedSectionId = useStadiumStore((state) => state.selectedSectionId);
  const selectedRow = useStadiumStore((state) => state.selectedRow);
  const selectedSeat = useStadiumStore((state) => state.selectedSeat);
  const { occupants } = radesStadiumConfig;
  const occupancy =
    renderQuality === 'high'
      ? occupants.highQualityCrowdOccupancy
      : occupants.lowQualityCrowdOccupancy;
  const members = useMemo(
    () => generateCrowdMembers(radesCrowdPlacementLayout.metadata, occupancy),
    [occupancy],
  );
  const instanceByPlacementKey = useMemo(() => {
    const index = new Map<string, number>();
    members.forEach((member, instanceId) => {
      const seat = member.placement;
      index.set(
        `${seat.sectionId}:${seat.rowNumber}:${seat.seatNumber}`,
        instanceId,
      );
    });
    return index;
  }, [members]);
  const bodyGeometry = useMemo(
    () => createPersonBodyGeometry('seated', occupants.seatedPersonHeight),
    [occupants.seatedPersonHeight],
  );
  const headGeometry = useMemo(
    () =>
      createPersonHeadGeometry(
        'seated',
        occupants.seatedPersonHeight,
        renderQuality,
      ),
    [occupants.seatedPersonHeight, renderQuality],
  );
  const bodyMaterial = useMemo(
    () =>
      renderQuality === 'high'
        ? new MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 })
        : new MeshLambertMaterial({ color: '#ffffff' }),
    [renderQuality],
  );
  const headMaterial = useMemo(
    () =>
      renderQuality === 'high'
        ? new MeshStandardMaterial({ color: '#ffffff', roughness: 0.96 })
        : new MeshLambertMaterial({ color: '#ffffff' }),
    [renderQuality],
  );

  useLayoutEffect(() => {
    const body = bodyRef.current;
    const head = headRef.current;
    if (!body || !head) return;

    const matrix = new Matrix4();
    members.forEach((member, instanceId) => {
      matrix.fromArray(
        radesCrowdPlacementLayout.matrices,
        member.placementIndex * 16,
      );
      body.setMatrixAt(instanceId, matrix);
      head.setMatrixAt(instanceId, matrix);
      body.setColorAt(instanceId, clothingColors[member.clothingColorIndex]);
      head.setColorAt(instanceId, skinColors[member.skinColorIndex]);
    });
    body.instanceMatrix.needsUpdate = true;
    head.instanceMatrix.needsUpdate = true;
    if (body.instanceColor) body.instanceColor.needsUpdate = true;
    if (head.instanceColor) head.instanceColor.needsUpdate = true;
    body.computeBoundingSphere();
    head.computeBoundingSphere();
    hiddenInstanceRef.current = null;
  }, [members]);

  useEffect(() => {
    const body = bodyRef.current;
    const head = headRef.current;
    if (!body || !head) return;

    const matrix = new Matrix4();
    const applyVisibility = (instanceId: number, hidden: boolean) => {
      const member = members[instanceId];
      if (!member) return;
      matrix.fromArray(
        radesCrowdPlacementLayout.matrices,
        member.placementIndex * 16,
      );
      if (hidden) matrix.scale(hiddenScale);
      body.setMatrixAt(instanceId, matrix);
      head.setMatrixAt(instanceId, matrix);
    };

    if (hiddenInstanceRef.current !== null) {
      applyVisibility(hiddenInstanceRef.current, false);
    }

    const selectedKey = `${selectedSectionId}:${selectedRow}:${selectedSeat}`;
    const nextHidden =
      cameraMode === 'seat'
        ? (instanceByPlacementKey.get(selectedKey) ?? null)
        : null;
    if (nextHidden !== null) applyVisibility(nextHidden, true);
    hiddenInstanceRef.current = nextHidden;
    body.instanceMatrix.needsUpdate = true;
    head.instanceMatrix.needsUpdate = true;
  }, [
    cameraMode,
    instanceByPlacementKey,
    members,
    selectedRow,
    selectedSeat,
    selectedSectionId,
  ]);

  useEffect(
    () => () => {
      bodyGeometry.dispose();
      headGeometry.dispose();
      bodyMaterial.dispose();
      headMaterial.dispose();
    },
    [bodyGeometry, bodyMaterial, headGeometry, headMaterial],
  );

  return (
    <group name="static-seated-crowd" userData={{ animated: false }}>
      <instancedMesh
        ref={bodyRef}
        args={[bodyGeometry, bodyMaterial, members.length]}
        castShadow={false}
        raycast={ignoreRaycast}
        receiveShadow={false}
      />
      <instancedMesh
        ref={headRef}
        args={[headGeometry, headMaterial, members.length]}
        castShadow={false}
        raycast={ignoreRaycast}
        receiveShadow={false}
      />
    </group>
  );
}
