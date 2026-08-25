import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  CylinderGeometry,
  DoubleSide,
  Matrix4,
  MeshStandardMaterial,
  SphereGeometry,
  type InstancedMesh,
  type Vector3,
} from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { createPlayerTunnelFrameMatrices } from './createPlayerTunnelFrameMatrices';

export function PlayerEntranceTunnel() {
  const frameRef = useRef<InstancedMesh>(null);
  const wheelRef = useRef<InstancedMesh>(null);
  const { grandstand, pitch } = radesStadiumConfig;
  const wheelRadius = grandstand.playerTunnelFrameRadius * 3.2;
  const fieldEndZ =
    grandstand.side * (pitch.width / 2 + grandstand.playerTunnelPitchClearance);
  const standEndZ = fieldEndZ + grandstand.side * grandstand.playerTunnelLength;
  const centerZ = (fieldEndZ + standEndZ) / 2;
  const roofAngle = Math.atan2(
    grandstand.playerTunnelRidgeHeight - grandstand.playerTunnelEaveHeight,
    grandstand.playerTunnelWidth / 2,
  );
  const roofPanelWidth = Math.hypot(
    grandstand.playerTunnelWidth / 2,
    grandstand.playerTunnelRidgeHeight - grandstand.playerTunnelEaveHeight,
  );
  const layout = useMemo(
    () =>
      createPlayerTunnelFrameMatrices({
        eaveHeight: grandstand.playerTunnelEaveHeight,
        frameCount: grandstand.playerTunnelFrameCount,
        frameRadius: grandstand.playerTunnelFrameRadius,
        length: grandstand.playerTunnelLength,
        ridgeHeight: grandstand.playerTunnelRidgeHeight,
        width: grandstand.playerTunnelWidth,
      }),
    [grandstand],
  );
  const frameGeometry = useMemo(() => new CylinderGeometry(1, 1, 1, 7), []);
  const wheelGeometry = useMemo(
    () => new SphereGeometry(wheelRadius, 8, 6),
    [wheelRadius],
  );
  const frameMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#8d918c',
        metalness: 0.72,
        roughness: 0.34,
      }),
    [],
  );
  const wheelMaterial = useMemo(
    () => new MeshStandardMaterial({ color: '#151918', roughness: 0.82 }),
    [],
  );

  useLayoutEffect(() => {
    const frameMesh = frameRef.current;
    const wheelMesh = wheelRef.current;
    if (!frameMesh || !wheelMesh) return;

    layout.frameMembers.forEach((matrix, instanceId) =>
      frameMesh.setMatrixAt(instanceId, matrix),
    );
    layout.wheelPositions.forEach((position, instanceId) => {
      wheelMesh.setMatrixAt(instanceId, positionToMatrix(position));
    });
    for (const mesh of [frameMesh, wheelMesh]) {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  }, [layout]);

  useEffect(
    () => () => {
      frameGeometry.dispose();
      wheelGeometry.dispose();
      frameMaterial.dispose();
      wheelMaterial.dispose();
    },
    [frameGeometry, frameMaterial, wheelGeometry, wheelMaterial],
  );

  return (
    <group
      name="main-stand-player-entrance-tunnel"
      position={[0, 0.075, centerZ]}
      rotation={[0, grandstand.side === 1 ? 0 : Math.PI, 0]}
      userData={{
        dimensionsAreEstimates: true,
        reportedApproximateLengthMetres: 30,
        structureType: 'retractable-covered-player-route',
      }}
    >
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry
          args={[
            grandstand.playerTunnelWidth - 0.28,
            0.07,
            grandstand.playerTunnelLength,
          ]}
        />
        <meshStandardMaterial color="#783c35" roughness={0.94} />
      </mesh>

      {([-1, 1] as const).map((side) => (
        <mesh
          key={`side-${side}`}
          position={[
            (side * grandstand.playerTunnelWidth) / 2,
            grandstand.playerTunnelEaveHeight / 2,
            0,
          ]}
        >
          <boxGeometry
            args={[
              grandstand.playerTunnelFrameRadius * 0.72,
              grandstand.playerTunnelEaveHeight,
              grandstand.playerTunnelLength,
            ]}
          />
          <meshPhysicalMaterial
            color="#eeeae0"
            depthWrite={false}
            opacity={0.68}
            roughness={0.8}
            side={DoubleSide}
            transparent
          />
        </mesh>
      ))}

      {([-1, 1] as const).map((side) => (
        <mesh
          key={`roof-${side}`}
          position={[
            (side * grandstand.playerTunnelWidth) / 4,
            (grandstand.playerTunnelEaveHeight +
              grandstand.playerTunnelRidgeHeight) /
              2,
            0,
          ]}
          rotation={[0, 0, side === -1 ? roofAngle : -roofAngle]}
        >
          <boxGeometry
            args={[
              roofPanelWidth,
              grandstand.playerTunnelFrameRadius * 0.8,
              grandstand.playerTunnelLength,
            ]}
          />
          <meshPhysicalMaterial
            color="#f4f0e5"
            opacity={0.9}
            roughness={0.78}
            side={DoubleSide}
            transparent
          />
        </mesh>
      ))}

      <mesh
        position={[
          0,
          grandstand.playerTunnelEaveHeight / 2,
          grandstand.playerTunnelLength / 2 +
            grandstand.playerTunnelFrameRadius,
        ]}
      >
        <boxGeometry
          args={[
            grandstand.playerTunnelWidth + 0.3,
            grandstand.playerTunnelEaveHeight + 0.22,
            grandstand.playerTunnelFrameRadius * 1.6,
          ]}
        />
        <meshStandardMaterial
          color="#253230"
          emissive="#101817"
          emissiveIntensity={0.12}
          roughness={0.9}
        />
      </mesh>

      <mesh
        position={[
          0,
          grandstand.playerTunnelEaveHeight - 0.22,
          -grandstand.playerTunnelLength / 2 -
            grandstand.playerTunnelFrameRadius,
        ]}
      >
        <boxGeometry
          args={[
            grandstand.playerTunnelWidth,
            0.38,
            grandstand.playerTunnelFrameRadius * 1.8,
          ]}
        />
        <meshStandardMaterial
          color="#236ca4"
          emissive="#143d60"
          emissiveIntensity={0.2}
          roughness={0.62}
        />
      </mesh>

      <instancedMesh
        ref={frameRef}
        args={[frameGeometry, frameMaterial, layout.frameMembers.length]}
        name="player-tunnel-ribs-and-scissor-braces"
      />
      <instancedMesh
        ref={wheelRef}
        args={[wheelGeometry, wheelMaterial, layout.wheelPositions.length]}
        name="player-tunnel-wheeled-bases"
      />
    </group>
  );
}

function positionToMatrix(position: Vector3) {
  return new Matrix4().setPosition(position);
}
