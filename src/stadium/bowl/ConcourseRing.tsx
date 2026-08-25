import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  BoxGeometry,
  DoubleSide,
  MeshStandardMaterial,
  type InstancedMesh,
} from 'three';

import type { StadiumConfig } from '../types/stadium.types';
import { createStadiumPerimeterWallGeometry } from '../geometry/createStadiumPerimeterWallGeometry';
import { getStadiumPerimeterAngleForDistance } from '../geometry/stadiumPerimeter';
import { createArchedPortalGeometry } from './createArchedPortalGeometry';
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
  const separationGaps = useMemo(
    () =>
      lowerTier.majorCutouts.map((cutout) => ({
        centerAngle:
          (cutout.boundaryIndex / lowerTier.sectionCount) * Math.PI * 2,
        angularWidth: getStadiumPerimeterAngleForDistance(
          cutout.width,
          features.concourse.radiusX,
          features.concourse.radiusZ,
        ),
      })),
    [features.concourse, lowerTier],
  );
  const boxGeometry = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const portalGeometry = useMemo(() => createArchedPortalGeometry(), []);
  const portalFrameGeometry = useMemo(
    () => createArchedPortalGeometry({ frameThickness: 0.075 }),
    [],
  );
  const wallGeometries = useMemo(
    () => ({
      accent: createStadiumPerimeterWallGeometry({
        bottom:
          features.concourse.bottom +
          features.concourse.height * 0.53 -
          details.concourseAccentBandHeight / 2,
        extentX: features.concourse.radiusX - 0.11,
        extentZ: features.concourse.radiusZ - 0.11,
        height: details.concourseAccentBandHeight,
        gaps: separationGaps,
      }),
      lowerFascia: createStadiumPerimeterWallGeometry({
        bottom: features.concourse.bottom,
        extentX: features.concourse.radiusX - 0.08,
        extentZ: features.concourse.radiusZ - 0.08,
        height: details.concourseFasciaHeight,
        gaps: separationGaps,
      }),
      shell: createStadiumPerimeterWallGeometry({
        bottom: features.concourse.bottom,
        extentX: features.concourse.radiusX,
        extentZ: features.concourse.radiusZ,
        height: features.concourse.height,
        gaps: separationGaps,
      }),
      upperFascia: createStadiumPerimeterWallGeometry({
        bottom: upperTier.baseHeight - details.concourseFasciaHeight,
        extentX: features.concourse.radiusX - 0.08,
        extentZ: features.concourse.radiusZ - 0.08,
        height: details.concourseFasciaHeight,
        gaps: separationGaps,
      }),
    }),
    [details, features.concourse, separationGaps, upperTier.baseHeight],
  );
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
      portalGeometry.dispose();
      portalFrameGeometry.dispose();
      Object.values(wallGeometries).forEach((geometry) => geometry.dispose());
      portalMaterial.dispose();
      frameMaterial.dispose();
      signMaterial.dispose();
      lightMaterial.dispose();
    },
    [
      boxGeometry,
      frameMaterial,
      lightMaterial,
      portalMaterial,
      portalFrameGeometry,
      portalGeometry,
      signMaterial,
      wallGeometries,
    ],
  );

  return (
    <group name="illuminated-concourse-ring">
      <mesh geometry={wallGeometries.shell}>
        <meshStandardMaterial
          color="#d1cfc4"
          roughness={0.94}
          side={DoubleSide}
        />
      </mesh>
      {[wallGeometries.lowerFascia, wallGeometries.upperFascia].map(
        (geometry, bandIndex) => (
          <mesh key={bandIndex} geometry={geometry}>
            <meshStandardMaterial
              color="#ebe7dc"
              roughness={0.88}
              side={DoubleSide}
            />
          </mesh>
        ),
      )}
      <mesh geometry={wallGeometries.accent}>
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
        args={[portalGeometry, portalMaterial, upperTier.sectionCount]}
        name="concourse-arched-portals"
      />
      <instancedMesh
        ref={frameRef}
        args={[
          portalFrameGeometry,
          frameMaterial,
          features.portalFrames.length,
        ]}
        name="concourse-arched-portal-surrounds"
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
