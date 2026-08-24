import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  BoxGeometry,
  DoubleSide,
  ExtrudeGeometry,
  MeshStandardMaterial,
  Shape,
  type InstancedMesh,
} from 'three';

import type { StadiumConfig } from '../types/stadium.types';
import { createConcourseFeatureMatrices } from './createConcourseFeatureMatrices';

type TierConfig = StadiumConfig['tiers'][number];
type BowlDetails = StadiumConfig['bowlDetails'];

function createPortalGeometry(details: BowlDetails) {
  const halfWidth = details.concoursePortalWidth / 2;
  const springHeight =
    details.concoursePortalHeight - details.concoursePortalArchRise;
  const shape = new Shape();
  shape.moveTo(-halfWidth, 0);
  shape.lineTo(halfWidth, 0);
  shape.lineTo(halfWidth, springHeight);
  shape.quadraticCurveTo(
    halfWidth,
    details.concoursePortalHeight,
    0,
    details.concoursePortalHeight,
  );
  shape.quadraticCurveTo(
    -halfWidth,
    details.concoursePortalHeight,
    -halfWidth,
    springHeight,
  );
  shape.closePath();
  const geometry = new ExtrudeGeometry(shape, {
    bevelEnabled: false,
    depth: details.concoursePortalDepth,
    steps: 1,
  });
  geometry.computeVertexNormals();
  return geometry;
}

export function ConcourseRing({
  details,
  lowerTier,
  upperTier,
}: {
  details: BowlDetails;
  lowerTier: TierConfig;
  upperTier: TierConfig;
}) {
  const portalRef = useRef<InstancedMesh>(null);
  const signRef = useRef<InstancedMesh>(null);
  const lightRef = useRef<InstancedMesh>(null);
  const features = useMemo(
    () => createConcourseFeatureMatrices(upperTier, lowerTier, details),
    [details, lowerTier, upperTier],
  );
  const portalGeometry = useMemo(
    () => createPortalGeometry(details),
    [details],
  );
  const boxGeometry = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const portalMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#416b68',
        emissive: '#173c38',
        emissiveIntensity: 0.24,
        roughness: 0.82,
      }),
    [],
  );
  const signMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#5dd794',
        emissive: '#31bc77',
        emissiveIntensity: 0.62,
        roughness: 0.55,
      }),
    [],
  );
  const lightMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#eef5e7',
        emissive: '#e6ffdf',
        emissiveIntensity: 1.4,
        roughness: 0.4,
      }),
    [],
  );

  useLayoutEffect(() => {
    const portalMesh = portalRef.current;
    const signMesh = signRef.current;
    const lightMesh = lightRef.current;
    if (!portalMesh || !signMesh || !lightMesh) return;

    features.portals.forEach((matrix, instanceId) =>
      portalMesh.setMatrixAt(instanceId, matrix),
    );
    features.signs.forEach((matrix, instanceId) =>
      signMesh.setMatrixAt(instanceId, matrix),
    );
    features.lights.forEach((matrix, instanceId) =>
      lightMesh.setMatrixAt(instanceId, matrix),
    );
    [portalMesh, signMesh, lightMesh].forEach((mesh) => {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    });
  }, [features]);

  useEffect(
    () => () => {
      portalGeometry.dispose();
      boxGeometry.dispose();
      portalMaterial.dispose();
      signMaterial.dispose();
      lightMaterial.dispose();
    },
    [boxGeometry, lightMaterial, portalGeometry, portalMaterial, signMaterial],
  );

  return (
    <group name="illuminated-concourse-ring">
      <mesh
        position={[
          0,
          features.concourse.bottom + features.concourse.height / 2,
          0,
        ]}
        scale={[
          features.concourse.radiusX,
          features.concourse.height,
          features.concourse.radiusZ,
        ]}
      >
        <cylinderGeometry args={[1, 1, 1, 192, 1, true]} />
        <meshStandardMaterial
          color="#9ca59f"
          roughness={0.94}
          side={DoubleSide}
        />
      </mesh>
      <instancedMesh
        ref={portalRef}
        args={[portalGeometry, portalMaterial, upperTier.sectionCount]}
        name="concourse-arched-portals"
      />
      <instancedMesh
        ref={signRef}
        args={[boxGeometry, signMaterial, upperTier.sectionCount]}
        name="concourse-exit-signs"
      />
      <instancedMesh
        ref={lightRef}
        args={[boxGeometry, lightMaterial, upperTier.sectionCount]}
        name="concourse-light-strips"
      />
    </group>
  );
}
