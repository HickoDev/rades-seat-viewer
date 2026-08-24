import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  Color,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
  type InstancedMesh,
} from 'three';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { useRenderQuality } from '../utils/useRenderQuality';
import {
  createPersonBodyGeometry,
  createPersonHeadGeometry,
} from './createPersonGeometry';
import { createTechnicalAreaLayout } from './technicalAreaLayout';

const homeTracksuit = new Color('#9e1730');
const awayTracksuit = new Color('#202d3e');
const staffSkinColors = [
  new Color('#e4b189'),
  new Color('#c48259'),
  new Color('#8e593e'),
];
const upAxis = new Vector3(0, 1, 0);
const unitScale = new Vector3(1, 1, 1);
const ignoreRaycast = () => undefined;

export function TechnicalAreaPeople() {
  const seatedBodyRef = useRef<InstancedMesh>(null);
  const seatedHeadRef = useRef<InstancedMesh>(null);
  const standingBodyRef = useRef<InstancedMesh>(null);
  const standingHeadRef = useRef<InstancedMesh>(null);
  const renderQuality = useRenderQuality();
  const { occupants } = radesStadiumConfig;
  const people = useMemo(
    () => createTechnicalAreaLayout(radesStadiumConfig),
    [],
  );
  const seatedPeople = useMemo(
    () => people.filter((person) => person.pose === 'seated'),
    [people],
  );
  const standingPeople = useMemo(
    () => people.filter((person) => person.pose === 'standing'),
    [people],
  );
  const seatedBodyGeometry = useMemo(
    () => createPersonBodyGeometry('seated', occupants.seatedPersonHeight),
    [occupants.seatedPersonHeight],
  );
  const seatedHeadGeometry = useMemo(
    () =>
      createPersonHeadGeometry(
        'seated',
        occupants.seatedPersonHeight,
        renderQuality,
      ),
    [occupants.seatedPersonHeight, renderQuality],
  );
  const standingBodyGeometry = useMemo(
    () => createPersonBodyGeometry('standing', occupants.standingPlayerHeight),
    [occupants.standingPlayerHeight],
  );
  const standingHeadGeometry = useMemo(
    () =>
      createPersonHeadGeometry(
        'standing',
        occupants.standingPlayerHeight,
        renderQuality,
      ),
    [occupants.standingPlayerHeight, renderQuality],
  );
  const bodyMaterial = useMemo(
    () => new MeshStandardMaterial({ color: '#ffffff', roughness: 0.82 }),
    [],
  );
  const headMaterial = useMemo(
    () => new MeshStandardMaterial({ color: '#ffffff', roughness: 0.94 }),
    [],
  );

  useLayoutEffect(() => {
    const groups = [
      {
        people: seatedPeople,
        body: seatedBodyRef.current,
        head: seatedHeadRef.current,
      },
      {
        people: standingPeople,
        body: standingBodyRef.current,
        head: standingHeadRef.current,
      },
    ];
    const matrix = new Matrix4();
    const position = new Vector3();
    const rotation = new Quaternion();

    groups.forEach(({ people: groupPeople, body, head }) => {
      if (!body || !head) return;
      groupPeople.forEach((person, instanceId) => {
        position.set(...person.position);
        rotation.setFromAxisAngle(upAxis, person.rotationY);
        matrix.compose(position, rotation, unitScale);
        body.setMatrixAt(instanceId, matrix);
        head.setMatrixAt(instanceId, matrix);
        body.setColorAt(
          instanceId,
          person.team === 'home' ? homeTracksuit : awayTracksuit,
        );
        head.setColorAt(
          instanceId,
          staffSkinColors[instanceId % staffSkinColors.length],
        );
      });
      body.instanceMatrix.needsUpdate = true;
      head.instanceMatrix.needsUpdate = true;
      if (body.instanceColor) body.instanceColor.needsUpdate = true;
      if (head.instanceColor) head.instanceColor.needsUpdate = true;
      body.computeBoundingSphere();
      head.computeBoundingSphere();
    });
  }, [seatedPeople, standingPeople]);

  useEffect(
    () => () => {
      seatedBodyGeometry.dispose();
      seatedHeadGeometry.dispose();
      standingBodyGeometry.dispose();
      standingHeadGeometry.dispose();
      bodyMaterial.dispose();
      headMaterial.dispose();
    },
    [
      bodyMaterial,
      headMaterial,
      seatedBodyGeometry,
      seatedHeadGeometry,
      standingBodyGeometry,
      standingHeadGeometry,
    ],
  );

  return (
    <group name="technical-area-people">
      <instancedMesh
        ref={seatedBodyRef}
        args={[seatedBodyGeometry, bodyMaterial, seatedPeople.length]}
        castShadow={renderQuality === 'high'}
        raycast={ignoreRaycast}
      />
      <instancedMesh
        ref={seatedHeadRef}
        args={[seatedHeadGeometry, headMaterial, seatedPeople.length]}
        castShadow={renderQuality === 'high'}
        raycast={ignoreRaycast}
      />
      <instancedMesh
        ref={standingBodyRef}
        args={[standingBodyGeometry, bodyMaterial, standingPeople.length]}
        castShadow={renderQuality === 'high'}
        raycast={ignoreRaycast}
      />
      <instancedMesh
        ref={standingHeadRef}
        args={[standingHeadGeometry, headMaterial, standingPeople.length]}
        castShadow={renderQuality === 'high'}
        raycast={ignoreRaycast}
      />
    </group>
  );
}
