import { useFrame } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  Color,
  InstancedBufferAttribute,
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
import { useReducedMotion } from '../utils/useReducedMotion';
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

type VirageBounceUniforms = {
  time: { value: number };
  amplitude: { value: number };
  cyclesPerSecond: { value: number };
  enabled: { value: number };
};

type VirageMaterial = MeshLambertMaterial | MeshStandardMaterial;

function enableVirageBounce(
  material: VirageMaterial,
  uniforms: VirageBounceUniforms,
): VirageMaterial {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uVirageTime = uniforms.time;
    shader.uniforms.uVirageAmplitude = uniforms.amplitude;
    shader.uniforms.uVirageCyclesPerSecond = uniforms.cyclesPerSecond;
    shader.uniforms.uVirageMotionEnabled = uniforms.enabled;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
attribute vec3 virageMotion;
uniform float uVirageTime;
uniform float uVirageAmplitude;
uniform float uVirageCyclesPerSecond;
uniform float uVirageMotionEnabled;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
if (uVirageMotionEnabled > 0.5 && virageMotion.z > 0.5) {
  float virageWave =
    uVirageTime * uVirageCyclesPerSecond * 6.28318530718 + virageMotion.x;
  float viragePulse = max(0.0, sin(virageWave));
  float virageFollowThrough = max(0.0, sin(virageWave * 0.5 + 0.8));
  float virageBounce =
    uVirageAmplitude * virageMotion.y *
    (viragePulse * 0.86 + virageFollowThrough * 0.14);
  transformed.y *= 1.0 - viragePulse * 0.022 * virageMotion.y;
  transformed.z +=
    sin(virageWave - 0.56548667765) * transformed.y * 0.035 * virageMotion.y;
  transformed.y += virageBounce;
}`,
      );
  };
  material.customProgramCacheKey = () => 'rades-virage-bounce-v1';
  material.userData.virageTimeUniform = uniforms.time;
  return material;
}

function updateVirageTimeUniform(
  mesh: InstancedMesh | null,
  elapsedSeconds: number,
): void {
  const material = mesh?.material;
  if (!material || Array.isArray(material)) return;
  const timeUniform = material.userData.virageTimeUniform as
    { value: number } | undefined;
  if (timeUniform) timeUniform.value = elapsedSeconds;
}

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
        occupants.virageAnimatedFraction,
        (placement) =>
          isTerraceSection(placement.sectionId) &&
          !isVisitorClosedSection(placement.sectionId),
      ),
    [occupancy, occupants.virageAnimatedFraction],
  );
  const motionData = useMemo(() => {
    const data = new Float32Array(members.length * 3);
    members.forEach((member, instanceId) => {
      const placement = member.placement;
      data[instanceId * 3] =
        placement.rowNumber * 0.19 +
        placement.seatNumber * 0.065 +
        member.motionPhase * 0.14;
      data[instanceId * 3 + 1] = member.motionStrength;
      data[instanceId * 3 + 2] = member.animated ? 1 : 0;
    });
    return data;
  }, [members]);
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
  const motionAttributes = useMemo(
    () =>
      Array.from(
        { length: 3 },
        () => new InstancedBufferAttribute(motionData.slice(), 3),
      ),
    [motionData],
  );
  const bounceUniforms = useMemo<VirageBounceUniforms>(
    () => ({
      time: { value: 0 },
      amplitude: { value: occupants.virageBounceAmplitude },
      cyclesPerSecond: { value: occupants.virageBounceCyclesPerSecond },
      enabled: { value: prefersReducedMotion ? 0 : 1 },
    }),
    [
      occupants.virageBounceAmplitude,
      occupants.virageBounceCyclesPerSecond,
      prefersReducedMotion,
    ],
  );
  const bodyMaterial = useMemo(() => {
    const material =
      renderQuality === 'high'
        ? new MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 })
        : new MeshLambertMaterial({ color: '#ffffff' });
    return prefersReducedMotion
      ? material
      : enableVirageBounce(material, bounceUniforms);
  }, [bounceUniforms, prefersReducedMotion, renderQuality]);
  const headMaterial = useMemo(
    () =>
      prefersReducedMotion
        ? new MeshLambertMaterial({ color: '#ffffff' })
        : enableVirageBounce(
            new MeshLambertMaterial({ color: '#ffffff' }),
            bounceUniforms,
          ),
    [bounceUniforms, prefersReducedMotion],
  );
  const hairMaterial = useMemo(
    () =>
      prefersReducedMotion
        ? new MeshLambertMaterial({ color: '#ffffff' })
        : enableVirageBounce(
            new MeshLambertMaterial({ color: '#ffffff' }),
            bounceUniforms,
          ),
    [bounceUniforms, prefersReducedMotion],
  );

  useLayoutEffect(() => {
    if (prefersReducedMotion) return;
    const geometries = [bodyGeometry, headGeometry, hairGeometry];
    geometries.forEach((geometry, index) => {
      geometry.setAttribute('virageMotion', motionAttributes[index]);
    });
    return () => {
      geometries.forEach((geometry) => {
        geometry.deleteAttribute('virageMotion');
      });
    };
  }, [
    bodyGeometry,
    hairGeometry,
    headGeometry,
    motionAttributes,
    prefersReducedMotion,
  ]);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    const head = headRef.current;
    const hair = hairRef.current;
    if (!body || !head) return;

    const matrix = new Matrix4();
    members.forEach((member, instanceId) => {
      if (hiddenInstanceRef.current === instanceId) {
        matrix.copy(hiddenMatrix);
      } else {
        matrix.fromArray(
          radesCrowdPlacementLayout.matrices,
          member.placementIndex * 16,
        );
      }
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

  useFrame((state) => {
    if (prefersReducedMotion) return;
    updateVirageTimeUniform(bodyRef.current, state.clock.getElapsedTime());
  });

  useEffect(
    () => () => {
      bodyGeometry.dispose();
      headGeometry.dispose();
      hairGeometry.dispose();
    },
    [bodyGeometry, hairGeometry, headGeometry],
  );

  useEffect(
    () => () => {
      bodyMaterial.dispose();
      headMaterial.dispose();
      hairMaterial.dispose();
    },
    [bodyMaterial, hairMaterial, headMaterial],
  );

  return (
    <group
      name="standing-virage-crowd"
      userData={{
        animated: true,
        animatedFraction: occupants.virageAnimatedFraction,
        seatingType: 'terrace',
      }}
    >
      <instancedMesh
        ref={bodyRef}
        args={[bodyGeometry, bodyMaterial, members.length]}
        raycast={ignoreRaycast}
        receiveShadow={renderQuality === 'high'}
      />
      <instancedMesh
        ref={headRef}
        args={[headGeometry, headMaterial, members.length]}
        raycast={ignoreRaycast}
        receiveShadow={renderQuality === 'high'}
      />
      {renderQuality === 'high' && (
        <instancedMesh
          ref={hairRef}
          args={[hairGeometry, hairMaterial, members.length]}
          raycast={ignoreRaycast}
          receiveShadow
        />
      )}
    </group>
  );
}
