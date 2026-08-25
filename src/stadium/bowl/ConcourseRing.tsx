import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  BoxGeometry,
  DoubleSide,
  MeshStandardMaterial,
  type InstancedMesh,
} from 'three';

import type { StadiumConfig } from '../types/stadium.types';
import { createConcourseFeatureMatrices } from './createConcourseFeatureMatrices';

type TierConfig = StadiumConfig['tiers'][number];
type BowlDetails = StadiumConfig['bowlDetails'];

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
  const frameRef = useRef<InstancedMesh>(null);
  const signRef = useRef<InstancedMesh>(null);
  const lightRef = useRef<InstancedMesh>(null);
  const features = useMemo(
    () => createConcourseFeatureMatrices(upperTier, lowerTier, details),
    [details, lowerTier, upperTier],
  );
  const boxGeometry = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const portalMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#233b43',
        emissive: '#163d4b',
        emissiveIntensity: 0.24,
        roughness: 0.82,
      }),
    [],
  );
  const frameMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#e6e5db',
        metalness: 0.08,
        roughness: 0.86,
      }),
    [],
  );
  const signMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#287fc1',
        emissive: '#164f86',
        emissiveIntensity: 0.46,
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
    const frameMesh = frameRef.current;
    const signMesh = signRef.current;
    const lightMesh = lightRef.current;
    if (!portalMesh || !frameMesh || !signMesh || !lightMesh) return;

    features.portals.forEach((matrix, instanceId) =>
      portalMesh.setMatrixAt(instanceId, matrix),
    );
    features.portalFrames.forEach((matrix, instanceId) =>
      frameMesh.setMatrixAt(instanceId, matrix),
    );
    features.signs.forEach((matrix, instanceId) =>
      signMesh.setMatrixAt(instanceId, matrix),
    );
    features.lights.forEach((matrix, instanceId) =>
      lightMesh.setMatrixAt(instanceId, matrix),
    );
    [portalMesh, frameMesh, signMesh, lightMesh].forEach((mesh) => {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    });
  }, [features]);

  useEffect(
    () => () => {
      boxGeometry.dispose();
      portalMaterial.dispose();
      frameMaterial.dispose();
      signMaterial.dispose();
      lightMaterial.dispose();
    },
    [boxGeometry, frameMaterial, lightMaterial, portalMaterial, signMaterial],
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
          color="#d1cfc4"
          roughness={0.94}
          side={DoubleSide}
        />
      </mesh>
      {[features.concourse.bottom, upperTier.baseHeight].map(
        (height, bandIndex) => (
          <mesh
            key={height}
            position={[
              0,
              height +
                ((bandIndex === 0 ? 1 : -1) * details.concourseFasciaHeight) /
                  2,
              0,
            ]}
            scale={[
              features.concourse.radiusX - 0.08,
              details.concourseFasciaHeight,
              features.concourse.radiusZ - 0.08,
            ]}
          >
            <cylinderGeometry args={[1, 1, 1, 192, 1, true]} />
            <meshStandardMaterial
              color="#ebe7dc"
              roughness={0.88}
              side={DoubleSide}
            />
          </mesh>
        ),
      )}
      <mesh
        position={[
          0,
          features.concourse.bottom + features.concourse.height * 0.53,
          0,
        ]}
        scale={[
          features.concourse.radiusX - 0.11,
          details.concourseAccentBandHeight,
          features.concourse.radiusZ - 0.11,
        ]}
      >
        <cylinderGeometry args={[1, 1, 1, 192, 1, true]} />
        <meshStandardMaterial
          color="#236eb3"
          emissive="#123b6d"
          emissiveIntensity={0.22}
          roughness={0.7}
          side={DoubleSide}
        />
      </mesh>
      <instancedMesh
        ref={portalRef}
        args={[boxGeometry, portalMaterial, upperTier.sectionCount]}
        name="concourse-rectangular-portals"
      />
      <instancedMesh
        ref={frameRef}
        args={[boxGeometry, frameMaterial, features.portalFrames.length]}
        name="concourse-portal-frames"
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
