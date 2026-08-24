import { useFrame } from '@react-three/fiber';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import {
  Color,
  Matrix4,
  MeshLambertMaterial,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
  type InstancedMesh,
} from 'three';

import { useStadiumStore } from '../state/useStadiumStore';
import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { useReducedMotion } from '../utils/useReducedMotion';
import { useRenderQuality } from '../utils/useRenderQuality';
import {
  generateCrowdMembers,
  radesCrowdPlacementLayout,
  type CrowdMember,
} from './crowdLayout';
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
const unitScale = new Vector3(1, 1, 1);
const upAxis = new Vector3(0, 1, 0);
const ignoreRaycast = () => undefined;

type CrowdPartition = 'static' | 'animated';
type InstanceLocation = { partition: CrowdPartition; instanceId: number };

function placementKey(member: CrowdMember): string {
  const placement = member.placement;
  return `${placement.sectionId}:${placement.rowNumber}:${placement.seatNumber}`;
}

export function StadiumCrowd() {
  const staticBodyRef = useRef<InstancedMesh>(null);
  const staticHeadRef = useRef<InstancedMesh>(null);
  const animatedBodyRef = useRef<InstancedMesh>(null);
  const animatedHeadRef = useRef<InstancedMesh>(null);
  const hiddenLocationRef = useRef<InstanceLocation | null>(null);
  const lastAnimationUpdateRef = useRef(-1);
  const elapsedRef = useRef(0);
  const renderQuality = useRenderQuality();
  const prefersReducedMotion = useReducedMotion();
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
        occupants.crowdAnimatedFraction,
      ),
    [occupancy, occupants.crowdAnimatedFraction],
  );
  const staticMembers = useMemo(
    () => members.filter((member) => !member.animated),
    [members],
  );
  const animatedMembers = useMemo(
    () => members.filter((member) => member.animated),
    [members],
  );
  const instanceByPlacementKey = useMemo(() => {
    const index = new Map<string, InstanceLocation>();
    staticMembers.forEach((member, instanceId) => {
      index.set(placementKey(member), { partition: 'static', instanceId });
    });
    animatedMembers.forEach((member, instanceId) => {
      index.set(placementKey(member), { partition: 'animated', instanceId });
    });
    return index;
  }, [animatedMembers, staticMembers]);
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
  const transforms = useMemo(
    () => ({
      matrix: new Matrix4(),
      position: new Vector3(),
      rotation: new Quaternion(),
    }),
    [],
  );

  const updateAnimatedMatrices = useCallback(
    (elapsedSeconds: number) => {
      const body = animatedBodyRef.current;
      const head = animatedHeadRef.current;
      if (!body || !head) return;

      animatedMembers.forEach((member, instanceId) => {
        const placement = member.placement;
        const wave =
          elapsedSeconds * occupants.crowdMotionCyclesPerSecond * Math.PI * 2 +
          member.motionPhase;
        const bob =
          Math.sin(wave) *
          occupants.crowdMotionAmplitude *
          member.motionStrength;
        const sway = Math.sin(wave * 0.71) * 0.025 * member.motionStrength;
        transforms.position.set(
          placement.position[0],
          placement.position[1] + bob,
          placement.position[2],
        );
        transforms.rotation.setFromAxisAngle(
          upAxis,
          placement.rotationY + sway,
        );
        const hidden =
          hiddenLocationRef.current?.partition === 'animated' &&
          hiddenLocationRef.current.instanceId === instanceId;
        transforms.matrix.compose(
          transforms.position,
          transforms.rotation,
          hidden ? hiddenScale : unitScale,
        );
        body.setMatrixAt(instanceId, transforms.matrix);
        head.setMatrixAt(instanceId, transforms.matrix);
      });
      body.instanceMatrix.needsUpdate = true;
      head.instanceMatrix.needsUpdate = true;
    },
    [
      animatedMembers,
      occupants.crowdMotionAmplitude,
      occupants.crowdMotionCyclesPerSecond,
      transforms,
    ],
  );

  useLayoutEffect(() => {
    const staticBody = staticBodyRef.current;
    const staticHead = staticHeadRef.current;
    const animatedBody = animatedBodyRef.current;
    const animatedHead = animatedHeadRef.current;
    if (!staticBody || !staticHead || !animatedBody || !animatedHead) return;

    const matrix = new Matrix4();
    staticMembers.forEach((member, instanceId) => {
      matrix.fromArray(
        radesCrowdPlacementLayout.matrices,
        member.placementIndex * 16,
      );
      staticBody.setMatrixAt(instanceId, matrix);
      staticHead.setMatrixAt(instanceId, matrix);
      staticBody.setColorAt(
        instanceId,
        clothingColors[member.clothingColorIndex],
      );
      staticHead.setColorAt(instanceId, skinColors[member.skinColorIndex]);
    });
    animatedMembers.forEach((member, instanceId) => {
      animatedBody.setColorAt(
        instanceId,
        clothingColors[member.clothingColorIndex],
      );
      animatedHead.setColorAt(instanceId, skinColors[member.skinColorIndex]);
    });
    updateAnimatedMatrices(0);

    [staticBody, staticHead, animatedBody, animatedHead].forEach((mesh) => {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
    });
    hiddenLocationRef.current = null;
  }, [animatedMembers, staticMembers, updateAnimatedMatrices]);

  useEffect(() => {
    const staticBody = staticBodyRef.current;
    const staticHead = staticHeadRef.current;
    if (!staticBody || !staticHead) return;

    const matrix = new Matrix4();
    const previous = hiddenLocationRef.current;
    if (previous?.partition === 'static') {
      const member = staticMembers[previous.instanceId];
      if (member) {
        matrix.fromArray(
          radesCrowdPlacementLayout.matrices,
          member.placementIndex * 16,
        );
        staticBody.setMatrixAt(previous.instanceId, matrix);
        staticHead.setMatrixAt(previous.instanceId, matrix);
      }
    }

    const selectedKey = `${selectedSectionId}:${selectedRow}:${selectedSeat}`;
    const nextHidden =
      cameraMode === 'seat'
        ? (instanceByPlacementKey.get(selectedKey) ?? null)
        : null;
    hiddenLocationRef.current = nextHidden;
    if (nextHidden?.partition === 'static') {
      const member = staticMembers[nextHidden.instanceId];
      if (member) {
        matrix.fromArray(
          radesCrowdPlacementLayout.matrices,
          member.placementIndex * 16,
        );
        matrix.scale(hiddenScale);
        staticBody.setMatrixAt(nextHidden.instanceId, matrix);
        staticHead.setMatrixAt(nextHidden.instanceId, matrix);
      }
    }
    staticBody.instanceMatrix.needsUpdate = true;
    staticHead.instanceMatrix.needsUpdate = true;
    updateAnimatedMatrices(elapsedRef.current);
  }, [
    cameraMode,
    instanceByPlacementKey,
    selectedRow,
    selectedSeat,
    selectedSectionId,
    staticMembers,
    updateAnimatedMatrices,
  ]);

  useFrame((state) => {
    if (prefersReducedMotion) return;
    const elapsed = state.clock.getElapsedTime();
    elapsedRef.current = elapsed;
    const updatesPerSecond = renderQuality === 'high' ? 20 : 12;
    if (elapsed - lastAnimationUpdateRef.current < 1 / updatesPerSecond) return;
    lastAnimationUpdateRef.current = elapsed;
    updateAnimatedMatrices(elapsed);
  });

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
    <group
      name="stadium-crowd"
      userData={{
        animated: true,
        animatedFraction: occupants.crowdAnimatedFraction,
      }}
    >
      <instancedMesh
        ref={staticBodyRef}
        args={[bodyGeometry, bodyMaterial, staticMembers.length]}
        castShadow={false}
        raycast={ignoreRaycast}
        receiveShadow={false}
      />
      <instancedMesh
        ref={staticHeadRef}
        args={[headGeometry, headMaterial, staticMembers.length]}
        castShadow={false}
        raycast={ignoreRaycast}
        receiveShadow={false}
      />
      <instancedMesh
        ref={animatedBodyRef}
        args={[bodyGeometry, bodyMaterial, animatedMembers.length]}
        castShadow={false}
        frustumCulled={false}
        raycast={ignoreRaycast}
        receiveShadow={false}
      />
      <instancedMesh
        ref={animatedHeadRef}
        args={[headGeometry, headMaterial, animatedMembers.length]}
        castShadow={false}
        frustumCulled={false}
        raycast={ignoreRaycast}
        receiveShadow={false}
      />
    </group>
  );
}
