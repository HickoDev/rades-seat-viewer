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
import { createStaticPlayerLayout } from './playerLayout';

const homeKit = new Color('#cf1738');
const awayKit = new Color('#f2f0e9');
const homeGoalkeeperKit = new Color('#f4cb32');
const awayGoalkeeperKit = new Color('#2fb777');
const playerSkinColors = [new Color('#dba47b'), new Color('#a96849')];
const upAxis = new Vector3(0, 1, 0);
const unitScale = new Vector3(1, 1, 1);
const ignoreRaycast = () => undefined;

export function StaticPlayers() {
  const bodyRef = useRef<InstancedMesh>(null);
  const headRef = useRef<InstancedMesh>(null);
  const renderQuality = useRenderQuality();
  const { occupants, pitch } = radesStadiumConfig;
  const players = useMemo(() => createStaticPlayerLayout(pitch), [pitch]);
  const bodyGeometry = useMemo(
    () => createPersonBodyGeometry('standing', occupants.standingPlayerHeight),
    [occupants.standingPlayerHeight],
  );
  const headGeometry = useMemo(
    () =>
      createPersonHeadGeometry(
        'standing',
        occupants.standingPlayerHeight,
        renderQuality,
      ),
    [occupants.standingPlayerHeight, renderQuality],
  );
  const bodyMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.82,
      }),
    [],
  );
  const headMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#ffffff',
        roughness: 0.95,
      }),
    [],
  );

  useLayoutEffect(() => {
    const body = bodyRef.current;
    const head = headRef.current;
    if (!body || !head) return;

    const matrix = new Matrix4();
    const position = new Vector3();
    const rotation = new Quaternion();
    players.forEach((player, instanceId) => {
      position.set(...player.position);
      rotation.setFromAxisAngle(upAxis, player.rotationY);
      matrix.compose(position, rotation, unitScale);
      body.setMatrixAt(instanceId, matrix);
      head.setMatrixAt(instanceId, matrix);
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
      head.setColorAt(instanceId, playerSkinColors[instanceId % 2]);
    });
    body.instanceMatrix.needsUpdate = true;
    head.instanceMatrix.needsUpdate = true;
    if (body.instanceColor) body.instanceColor.needsUpdate = true;
    if (head.instanceColor) head.instanceColor.needsUpdate = true;
    body.computeBoundingSphere();
    head.computeBoundingSphere();
  }, [players]);

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
    <group name="static-match-players" userData={{ animated: false }}>
      <instancedMesh
        ref={bodyRef}
        args={[bodyGeometry, bodyMaterial, players.length]}
        castShadow={renderQuality === 'high'}
        raycast={ignoreRaycast}
      />
      <instancedMesh
        ref={headRef}
        args={[headGeometry, headMaterial, players.length]}
        castShadow={renderQuality === 'high'}
        raycast={ignoreRaycast}
      />
      <mesh name="static-match-ball" position={[0, 0.2, 0]} castShadow>
        <sphereGeometry args={[0.11, 10, 8]} />
        <meshStandardMaterial color="#f4f1e7" roughness={0.76} />
      </mesh>
    </group>
  );
}
