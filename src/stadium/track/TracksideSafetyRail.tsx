import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  CylinderGeometry,
  MeshStandardMaterial,
  type InstancedMesh,
} from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { createTracksideRailMatrices } from './createTracksideRailMatrices';

export function TracksideSafetyRail() {
  const meshRef = useRef<InstancedMesh>(null);
  const lowerTier = radesStadiumConfig.tiers[0];
  const details = radesStadiumConfig.bowlDetails;
  const geometry = useMemo(() => new CylinderGeometry(1, 1, 1, 7), []);
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#d7ddda',
        metalness: 0.62,
        roughness: 0.38,
      }),
    [],
  );
  const matrices = useMemo(
    () =>
      createTracksideRailMatrices({
        baseHeight: lowerTier.baseHeight + lowerTier.rowHeight,
        height: details.tracksideRailHeight,
        midRailRatio: details.tracksideRailMidRatio,
        radius: details.tracksideRailRadius,
        radiusX: lowerTier.startRadiusX - details.tracksideRailInset,
        radiusZ: lowerTier.startRadiusZ - details.tracksideRailInset,
        segmentCount: details.tracksideRailSegmentCount,
      }),
    [details, lowerTier],
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    matrices.forEach((matrix, instanceId) =>
      mesh.setMatrixAt(instanceId, matrix),
    );
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [matrices]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, matrices.length]}
      name="continuous-trackside-safety-rail"
      userData={{ dimensionsAreEstimates: true }}
    />
  );
}
