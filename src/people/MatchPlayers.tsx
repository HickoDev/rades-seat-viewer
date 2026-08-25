import { useFrame } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import {
  Color,
  Euler,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
  type InstancedMesh,
  type Mesh,
} from 'three';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { useReducedMotion } from '../utils/useReducedMotion';
import { useRenderQuality } from '../utils/useRenderQuality';
import {
  createPersonBodyGeometry,
  createPersonHairGeometry,
  createPersonHeadGeometry,
} from './createPersonGeometry';
import {
  calculateBallPosition,
  calculateMatchPlayerPose,
  createMatchPlayerLayout,
} from './playerLayout';

const homeKit = new Color('#c80f2e');
const awayKit = new Color('#f2eee5');
const homeGoalkeeperKit = new Color('#f4c928');
const awayGoalkeeperKit = new Color('#27ad70');
const playerSkinColors = [
  new Color('#e7b58c'),
  new Color('#c6845d'),
  new Color('#925a3d'),
];
const playerHairColors = [
  new Color('#171310'),
  new Color('#35251c'),
  new Color('#0d0d0c'),
];
const ignoreRaycast = () => undefined;

export function MatchPlayers() {
  const bodyRef = useRef<InstancedMesh>(null);
  const headRef = useRef<InstancedMesh>(null);
  const hairRef = useRef<InstancedMesh>(null);
  const ballRef = useRef<Mesh>(null);
  const renderQuality = useRenderQuality();
  const prefersReducedMotion = useReducedMotion();
  const { occupants, pitch } = radesStadiumConfig;
  const players = useMemo(() => createMatchPlayerLayout(pitch), [pitch]);
  const bodyGeometry = useMemo(
    () =>
      createPersonBodyGeometry(
        'athletic',
        occupants.standingPlayerHeight,
        renderQuality,
      ),
    [occupants.standingPlayerHeight, renderQuality],
  );
  const headGeometry = useMemo(
    () =>
      createPersonHeadGeometry(
        'athletic',
        occupants.standingPlayerHeight,
        renderQuality,
      ),
    [occupants.standingPlayerHeight, renderQuality],
  );
  const hairGeometry = useMemo(
    () =>
      createPersonHairGeometry(
        'athletic',
        occupants.standingPlayerHeight,
        renderQuality,
      ),
    [occupants.standingPlayerHeight, renderQuality],
  );
  const bodyMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.76,
      }),
    [],
  );
  const headMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.92,
      }),
    [],
  );
  const hairMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.98,
      }),
    [],
  );
  const transforms = useMemo(
    () => ({
      matrix: new Matrix4(),
      position: new Vector3(),
      rotation: new Quaternion(),
      euler: new Euler(0, 0, 0, 'YXZ'),
      scale: new Vector3(1, 1, 1),
    }),
    [],
  );

  const updatePlayers = (elapsedSeconds: number) => {
    const body = bodyRef.current;
    const head = headRef.current;
    const hair = hairRef.current;
    if (!body || !head || !hair) return;

    const ballPosition = calculateBallPosition(elapsedSeconds, pitch);
    players.forEach((player, instanceId) => {
      const pose = calculateMatchPlayerPose(
        player,
        elapsedSeconds,
        pitch,
        ballPosition,
      );
      transforms.position.set(...pose.position);
      const runningAmount = Math.min(pose.movementSpeed / 6.5, 1);
      const strideCompression =
        Math.abs(Math.sin(pose.stridePhase)) * runningAmount * 0.018;
      const lateralLean = Math.sin(pose.stridePhase) * runningAmount * 0.018;
      transforms.euler.set(
        pose.leanRadians,
        pose.rotationY,
        lateralLean,
        'YXZ',
      );
      transforms.rotation.setFromEuler(transforms.euler);
      transforms.scale.set(
        1 + strideCompression * 0.28,
        1 - strideCompression,
        1 + strideCompression * 0.18,
      );
      transforms.matrix.compose(
        transforms.position,
        transforms.rotation,
        transforms.scale,
      );
      body.setMatrixAt(instanceId, transforms.matrix);
      head.setMatrixAt(instanceId, transforms.matrix);
      hair.setMatrixAt(instanceId, transforms.matrix);
    });
    body.instanceMatrix.needsUpdate = true;
    head.instanceMatrix.needsUpdate = true;
    hair.instanceMatrix.needsUpdate = true;

    if (ballRef.current) {
      ballRef.current.position.set(...ballPosition);
      ballRef.current.rotation.x = elapsedSeconds * 5.4;
      ballRef.current.rotation.z = elapsedSeconds * 3.7;
    }
  };

  useLayoutEffect(() => {
    const body = bodyRef.current;
    const head = headRef.current;
    const hair = hairRef.current;
    if (!body || !head || !hair) return;

    players.forEach((player, instanceId) => {
      body.setColorAt(
        instanceId,
        player.role === 'goalkeeper'
          ? player.team === 'home'
            ? homeGoalkeeperKit
            : awayGoalkeeperKit
          : player.team === 'home'
            ? homeKit
            : awayKit,
      );
      head.setColorAt(
        instanceId,
        playerSkinColors[instanceId % playerSkinColors.length],
      );
      hair.setColorAt(
        instanceId,
        playerHairColors[instanceId % playerHairColors.length],
      );
    });
    if (body.instanceColor) body.instanceColor.needsUpdate = true;
    if (head.instanceColor) head.instanceColor.needsUpdate = true;
    if (hair.instanceColor) hair.instanceColor.needsUpdate = true;
    updatePlayers(0);
    body.computeBoundingSphere();
    head.computeBoundingSphere();
    hair.computeBoundingSphere();
  });

  useFrame((state) => {
    if (prefersReducedMotion) return;
    updatePlayers(state.clock.getElapsedTime());
  });

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
    <group name="animated-match-players" userData={{ animated: true }}>
      <instancedMesh
        ref={bodyRef}
        args={[bodyGeometry, bodyMaterial, players.length]}
        castShadow={renderQuality === 'high'}
        frustumCulled={false}
        raycast={ignoreRaycast}
      />
      <instancedMesh
        ref={headRef}
        args={[headGeometry, headMaterial, players.length]}
        castShadow={renderQuality === 'high'}
        frustumCulled={false}
        raycast={ignoreRaycast}
      />
      <instancedMesh
        ref={hairRef}
        args={[hairGeometry, hairMaterial, players.length]}
        castShadow={renderQuality === 'high'}
        frustumCulled={false}
        raycast={ignoreRaycast}
      />
      <mesh ref={ballRef} name="match-ball" castShadow>
        <sphereGeometry args={[0.11, 12, 8]} />
        <meshStandardMaterial color="#f4f1e7" roughness={0.72} />
      </mesh>
    </group>
  );
}
