import { useLayoutEffect, useMemo, useRef } from 'react';
import { Object3D, Vector3, type InstancedMesh } from 'three';

import { createCylinderBetweenMatrix } from '../../utils/geometry';
import { radesStadiumConfig } from '../config/radesStadiumConfig';
import {
  getStadiumPerimeterFrame,
  getStadiumPerimeterPoint,
} from '../geometry/stadiumPerimeter';

export function LightingStructures() {
  const cableRef = useRef<InstancedMesh>(null);
  const floodlightRef = useRef<InstancedMesh>(null);
  const floodlightSupportRef = useRef<InstancedMesh>(null);
  const { roof } = radesStadiumConfig;
  const mastPlacements = useMemo(
    () =>
      Array.from({ length: roof.mastCount }, (_, mastIndex) => {
        const angle = (mastIndex / roof.mastCount) * Math.PI * 2;
        const point = getStadiumPerimeterPoint(
          angle,
          roof.outerRadiusX + roof.mastBaseOffset,
          roof.outerRadiusZ + roof.mastBaseOffset,
        );
        return {
          angle,
          x: point.x,
          z: point.z,
        };
      }),
    [roof],
  );
  const cableMatrices = useMemo(
    () =>
      mastPlacements.flatMap(({ angle, x, z }) => {
        const top = new Vector3(x, roof.mastHeight * 0.91, z);
        const roofStays = [-1, 0, 1].map((offset) => {
          const roofAngle = angle + (offset * Math.PI * 2) / roof.mastCount / 2;
          const roofPoint = getStadiumPerimeterPoint(
            roofAngle,
            roof.outerRadiusX,
            roof.outerRadiusZ,
          );
          return createCylinderBetweenMatrix(
            top,
            new Vector3(roofPoint.x, roof.outerHeight, roofPoint.z),
            roof.mastCableRadius,
          );
        });
        const groundPoint = getStadiumPerimeterPoint(
          angle,
          roof.outerRadiusX + roof.mastBaseOffset + roof.mastBackstayOffset,
          roof.outerRadiusZ + roof.mastBaseOffset + roof.mastBackstayOffset,
        );
        const groundAnchor = new Vector3(groundPoint.x, 0.7, groundPoint.z);
        return [
          ...roofStays,
          createCylinderBetweenMatrix(
            top,
            groundAnchor,
            roof.mastCableRadius * 0.82,
          ),
        ];
      }),
    [mastPlacements, roof],
  );
  const floodlightMatrices = useMemo(
    () =>
      Array.from({ length: roof.floodlightBankCount }, (_, bankIndex) => {
        const angle = (bankIndex / roof.floodlightBankCount) * Math.PI * 2;
        const frame = getStadiumPerimeterFrame(
          angle,
          roof.innerRadiusX + 1.2,
          roof.innerRadiusZ + 1.2,
        );
        const tangent = new Vector3(frame.tangentX, 0, frame.tangentZ);
        const center = new Vector3(
          frame.x,
          roof.innerHeight - roof.innerTrussDepth - roof.floodlightHeight,
          frame.z,
        );
        return Array.from(
          { length: roof.floodlightsPerBank },
          (_, fixtureIndex) => {
            const offset =
              (fixtureIndex - (roof.floodlightsPerBank - 1) / 2) *
              roof.floodlightSpacing;
            const fixture = new Object3D();
            fixture.position.copy(center).addScaledVector(tangent, offset);
            fixture.lookAt(0, 0, 0);
            fixture.scale.set(
              roof.floodlightWidth,
              roof.floodlightHeight,
              0.28,
            );
            fixture.updateMatrix();
            return fixture.matrix.clone();
          },
        );
      }).flat(),
    [roof],
  );
  const floodlightSupportMatrices = useMemo(
    () =>
      Array.from({ length: roof.floodlightBankCount }, (_, bankIndex) => {
        const angle = (bankIndex / roof.floodlightBankCount) * Math.PI * 2;
        const frame = getStadiumPerimeterFrame(
          angle,
          roof.innerRadiusX + 1.45,
          roof.innerRadiusZ + 1.45,
        );
        const tangent = new Vector3(frame.tangentX, 0, frame.tangentZ);
        const center = new Vector3(
          frame.x,
          roof.innerHeight - roof.innerTrussDepth + 0.18,
          frame.z,
        );
        const halfSpan =
          ((roof.floodlightsPerBank - 1) * roof.floodlightSpacing) / 2 +
          roof.floodlightWidth / 2;
        return createCylinderBetweenMatrix(
          center.clone().addScaledVector(tangent, -halfSpan),
          center.clone().addScaledVector(tangent, halfSpan),
          roof.floodlightSupportRadius,
        );
      }),
    [roof],
  );

  useLayoutEffect(() => {
    const cableMesh = cableRef.current;
    const floodlightMesh = floodlightRef.current;
    const supportMesh = floodlightSupportRef.current;
    if (!cableMesh || !floodlightMesh || !supportMesh) return;

    cableMatrices.forEach((matrix, instanceId) =>
      cableMesh.setMatrixAt(instanceId, matrix),
    );
    floodlightMatrices.forEach((matrix, instanceId) =>
      floodlightMesh.setMatrixAt(instanceId, matrix),
    );
    floodlightSupportMatrices.forEach((matrix, instanceId) =>
      supportMesh.setMatrixAt(instanceId, matrix),
    );
    [cableMesh, floodlightMesh, supportMesh].forEach((mesh) => {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    });
  }, [cableMatrices, floodlightMatrices, floodlightSupportMatrices]);

  return (
    <group name="roof-masts-cables-and-floodlights">
      {mastPlacements.map(({ angle, x, z }, mastIndex) => (
        <group key={mastIndex} position={[x, 0, z]} rotation={[0, -angle, 0]}>
          <mesh
            position={[0, roof.mastHeight / 2, 0]}
            userData={{ shadowOccluder: true, occluderType: 'roof-mast' }}
          >
            <cylinderGeometry
              args={[
                roof.mastTopRadius,
                roof.mastBaseRadius,
                roof.mastHeight,
                14,
              ]}
            />
            <meshStandardMaterial
              color="#e9ece7"
              metalness={0.32}
              roughness={0.48}
            />
          </mesh>
          <mesh position={[0, roof.mastHeight * 0.82, 0]}>
            <cylinderGeometry args={[2.05, 1.25, 0.42, 20]} />
            <meshStandardMaterial
              color="#d8ddd9"
              metalness={0.4}
              roughness={0.44}
            />
          </mesh>
        </group>
      ))}
      <instancedMesh
        ref={cableRef}
        args={[undefined, undefined, cableMatrices.length]}
        name="roof-mast-stay-cables"
      >
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshStandardMaterial
          color="#4f5857"
          metalness={0.68}
          roughness={0.34}
        />
      </instancedMesh>
      <instancedMesh
        ref={floodlightSupportRef}
        args={[undefined, undefined, floodlightSupportMatrices.length]}
        name="floodlight-bank-support-bars"
      >
        <cylinderGeometry args={[1, 1, 1, 7]} />
        <meshStandardMaterial
          color="#d7dcda"
          metalness={0.56}
          roughness={0.4}
        />
      </instancedMesh>
      <instancedMesh
        ref={floodlightRef}
        args={[undefined, undefined, floodlightMatrices.length]}
        name="inner-roof-floodlights"
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#e8eee5"
          emissive="#fff6d5"
          emissiveIntensity={0.78}
          metalness={0.18}
          roughness={0.36}
        />
      </instancedMesh>
    </group>
  );
}
