import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  Color,
  Matrix4,
  MeshLambertMaterial,
  MeshStandardMaterial,
  type InstancedMesh,
} from 'three';

import {
  isTerraceSection,
  isVisitorClosedSection,
} from '../seats/viewingPositions';
import { useStadiumStore } from '../state/useStadiumStore';
import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { useRenderQuality } from '../utils/useRenderQuality';
import {
  createPersonBodyGeometry,
  createPersonHairGeometry,
  createPersonHeadGeometry,
} from './createPersonGeometry';
import { generateCrowdMembers, radesCrowdPlacementLayout } from './crowdLayout';

const clothingColors = [
  new Color('#b71e35'),
  new Color('#f0ece2'),
  new Color('#18273e'),
  new Color('#2d668c'),
  new Color('#bd7130'),
  new Color('#3f7355'),
];
const skinColors = [
  new Color('#e8b991'),
  new Color('#ce8e66'),
  new Color('#a76749'),
  new Color('#76462f'),
];
const hairColors = [
  new Color('#15120f'),
  new Color('#302218'),
  new Color('#0d0d0c'),
];
const hiddenMatrix = new Matrix4().makeScale(0, 0, 0);
const ignoreRaycast = () => undefined;

function memberKey(member: ReturnType<typeof generateCrowdMembers>[number]) {
  const placement = member.placement;
  return `${placement.sectionId}:${placement.rowNumber}:${placement.seatNumber}`;
}

export function VirageCrowd() {
  const bodyRef = useRef<InstancedMesh>(null);
  const headRef = useRef<InstancedMesh>(null);
  const hairRef = useRef<InstancedMesh>(null);
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
    () =>
      generateCrowdMembers(
        radesCrowdPlacementLayout.metadata,
        occupancy,
        0,
      ).filter(
        (member) =>
          isTerraceSection(member.placement.sectionId) &&
          !isVisitorClosedSection(member.placement.sectionId),
      ),
    [occupancy],
  );
  const instanceByPlacement = useMemo(
    () =>
      new Map(
        members.map((member, instanceId) => [memberKey(member), instanceId]),
      ),
    [members],
  );
  const bodyGeometry = useMemo(
    () =>
      createPersonBodyGeometry(
        'standing',
        occupants.standingSpectatorHeight,
        'low',
      ),
    [occupants.standingSpectatorHeight],
  );
  const headGeometry = useMemo(
    () =>
      createPersonHeadGeometry(
        'standing',
        occupants.standingSpectatorHeight,
        'low',
      ),
    [occupants.standingSpectatorHeight],
  );
  const hairGeometry = useMemo(
    () =>
      createPersonHairGeometry(
        'standing',
        occupants.standingSpectatorHeight,
        'low',
      ),
    [occupants.standingSpectatorHeight],
  );
  const bodyMaterial = useMemo(
    () =>
      renderQuality === 'high'
        ? new MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 })
        : new MeshLambertMaterial({ color: '#ffffff' }),
    [renderQuality],
  );
  const headMaterial = useMemo(
    () => new MeshLambertMaterial({ color: '#ffffff' }),
    [],
  );
  const hairMaterial = useMemo(
    () => new MeshLambertMaterial({ color: '#ffffff' }),
    [],
  );

  useLayoutEffect(() => {
    const body = bodyRef.current;
    const head = headRef.current;
    const hair = hairRef.current;
    if (!body || !head) return;

    const matrix = new Matrix4();
    members.forEach((member, instanceId) => {
      matrix.fromArray(
        radesCrowdPlacementLayout.matrices,
        member.placementIndex * 16,
      );
      body.setMatrixAt(instanceId, matrix);
      head.setMatrixAt(instanceId, matrix);
      hair?.setMatrixAt(instanceId, matrix);
      body.setColorAt(
        instanceId,
        clothingColors[member.clothingColorIndex % clothingColors.length],
      );
      head.setColorAt(
        instanceId,
        skinColors[member.skinColorIndex % skinColors.length],
      );
      hair?.setColorAt(
        instanceId,
        hairColors[member.skinColorIndex % hairColors.length],
      );
    });
    for (const mesh of [body, head, hair]) {
      if (!mesh) continue;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
    hiddenInstanceRef.current = null;
  }, [members]);

  useEffect(() => {
    const meshes = [bodyRef.current, headRef.current, hairRef.current].filter(
      (mesh): mesh is InstancedMesh => mesh !== null,
    );
    const previous = hiddenInstanceRef.current;
    const restore = new Matrix4();
    if (previous !== null) {
      const member = members[previous];
      if (member) {
        restore.fromArray(
          radesCrowdPlacementLayout.matrices,
          member.placementIndex * 16,
        );
        meshes.forEach((mesh) => mesh.setMatrixAt(previous, restore));
      }
    }

    const selectedKey = `${selectedSectionId}:${selectedRow}:${selectedSeat}`;
    const next =
      cameraMode === 'seat' && isTerraceSection(selectedSectionId)
        ? (instanceByPlacement.get(selectedKey) ?? null)
        : null;
    hiddenInstanceRef.current = next;
    if (next !== null) {
      meshes.forEach((mesh) => mesh.setMatrixAt(next, hiddenMatrix));
    }
    meshes.forEach((mesh) => {
      mesh.instanceMatrix.needsUpdate = true;
    });
  }, [
    cameraMode,
    instanceByPlacement,
    members,
    selectedRow,
    selectedSeat,
    selectedSectionId,
  ]);

  useEffect(
    () => () => {
      bodyGeometry.dispose();
      headGeometry.dispose();
      hairGeometry.dispose();
      bodyMaterial.dispose();
      headMaterial.dispose();
      hairMaterial.dispose();
    },
    [
      bodyGeometry,
      bodyMaterial,
      hairGeometry,
      hairMaterial,
      headGeometry,
      headMaterial,
    ],
  );

  return (
    <group name="standing-virage-crowd" userData={{ seatingType: 'terrace' }}>
      <instancedMesh
        ref={bodyRef}
        args={[bodyGeometry, bodyMaterial, members.length]}
        raycast={ignoreRaycast}
      />
      <instancedMesh
        ref={headRef}
        args={[headGeometry, headMaterial, members.length]}
        raycast={ignoreRaycast}
      />
      {renderQuality === 'high' && (
        <instancedMesh
          ref={hairRef}
          args={[hairGeometry, hairMaterial, members.length]}
          raycast={ignoreRaycast}
        />
      )}
    </group>
  );
}
