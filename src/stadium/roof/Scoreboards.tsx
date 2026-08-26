import { useEffect, useMemo } from 'react';
import { CanvasTexture, MeshStandardMaterial, SRGBColorSpace } from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import { createScoreboardPlacements } from './scoreboardPlacements';

function createScoreboardMaterial() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create the scoreboard display.');

  context.fillStyle = '#071619';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#102a2f';
  context.fillRect(0, 0, canvas.width, 36);
  context.fillStyle = '#f1f6ed';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = '700 66px Arial';
  context.fillText('STADE DE RADÈS', canvas.width / 2, 132);
  context.font = '700 122px Arial';
  context.fillText('00:00', canvas.width / 2, 270);
  context.font = '600 46px Arial';
  context.fillStyle = '#8eb9bd';
  context.fillText('HAMMADI-AGREBI', canvas.width / 2, 398);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return {
    texture,
    material: new MeshStandardMaterial({
      map: texture,
      emissive: '#1f6f78',
      emissiveIntensity: 0.28,
      roughness: 0.32,
    }),
  };
}

export function Scoreboards() {
  const { structure } = radesStadiumConfig;
  const placements = useMemo(
    () => createScoreboardPlacements(radesStadiumConfig),
    [],
  );
  const display = useMemo(() => createScoreboardMaterial(), []);

  useEffect(
    () => () => {
      display.material.dispose();
      display.texture.dispose();
    },
    [display],
  );

  return (
    <group name="upper-virage-scoreboards">
      {placements.map((placement) => (
        <group
          key={placement.side}
          name={`scoreboard-${placement.side}`}
          position={placement.position}
          rotation={[0, placement.rotationY, 0]}
          userData={{
            placement: 'upper-virage-terrace',
            terraceHeight: placement.terraceHeight,
          }}
        >
          <mesh
            castShadow
            userData={{ shadowOccluder: true, occluderType: 'scoreboard' }}
          >
            <boxGeometry
              args={[
                structure.scoreboardWidth + 0.7,
                structure.scoreboardHeight + 0.7,
                structure.scoreboardDepth,
              ]}
            />
            <meshStandardMaterial
              color="#e2c641"
              metalness={0.26}
              roughness={0.56}
            />
          </mesh>

          <mesh
            material={display.material}
            position={[0, 0, structure.scoreboardDepth / 2 + 0.03]}
          >
            <planeGeometry
              args={[structure.scoreboardWidth, structure.scoreboardHeight]}
            />
          </mesh>

          <mesh
            castShadow
            position={[0, -structure.scoreboardHeight / 2 - 0.23, 0]}
          >
            <boxGeometry
              args={[
                structure.scoreboardWidth + 1.2,
                0.26,
                structure.scoreboardDeckDepth,
              ]}
            />
            <meshStandardMaterial color="#6d736f" roughness={0.76} />
          </mesh>

          {([-0.32, 0.32] as const).map((xRatio) => (
            <mesh
              castShadow
              key={xRatio}
              position={[
                structure.scoreboardWidth * xRatio,
                -structure.scoreboardHeight / 2 - placement.supportHeight / 2,
                0,
              ]}
            >
              <boxGeometry args={[0.32, placement.supportHeight, 0.42]} />
              <meshStandardMaterial
                color="#555d5a"
                metalness={0.32}
                roughness={0.64}
              />
            </mesh>
          ))}

          <mesh
            castShadow
            position={[
              0,
              -structure.scoreboardHeight / 2 - placement.supportHeight - 0.11,
              0,
            ]}
          >
            <boxGeometry
              args={[
                structure.scoreboardWidth * 0.76,
                0.22,
                structure.scoreboardDeckDepth * 0.82,
              ]}
            />
            <meshStandardMaterial color="#a9aaa3" roughness={0.94} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
