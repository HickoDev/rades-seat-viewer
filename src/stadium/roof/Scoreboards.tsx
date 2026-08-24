import { useEffect, useMemo } from 'react';
import { CanvasTexture, MeshStandardMaterial, SRGBColorSpace } from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';

function createScoreboardMaterial() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create the scoreboard display.');

  context.fillStyle = '#071619';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#1ca1b5';
  context.fillRect(0, 0, canvas.width, 56);
  context.fillStyle = '#bc2334';
  context.fillRect(0, canvas.height - 40, canvas.width, 40);
  context.fillStyle = '#f1f6ed';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = '700 66px Arial';
  context.fillText('STADE DE RADÈS', canvas.width / 2, 132);
  context.font = '700 122px Arial';
  context.fillText('00:00', canvas.width / 2, 270);
  context.font = '600 46px Arial';
  context.fillStyle = '#8ed5df';
  context.fillText('MATCH DAY', canvas.width / 2, 398);

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
  const { roof, structure } = radesStadiumConfig;
  const display = useMemo(() => createScoreboardMaterial(), []);

  useEffect(
    () => () => {
      display.material.dispose();
      display.texture.dispose();
    },
    [display],
  );

  return (
    <group name="suspended-end-scoreboards">
      {([-1, 1] as const).map((side) => (
        <group
          key={side}
          name={`scoreboard-${side}`}
          position={[
            side * (roof.innerRadiusX - structure.scoreboardDepth),
            roof.innerHeight -
              structure.scoreboardSupportDrop -
              structure.scoreboardHeight / 2,
            0,
          ]}
          rotation={[0, side === -1 ? Math.PI / 2 : -Math.PI / 2, 0]}
        >
          <mesh userData={{ shadowOccluder: true, occluderType: 'scoreboard' }}>
            <boxGeometry
              args={[
                structure.scoreboardWidth + 0.7,
                structure.scoreboardHeight + 0.7,
                structure.scoreboardDepth,
              ]}
            />
            <meshStandardMaterial
              color="#d9ddda"
              metalness={0.38}
              roughness={0.5}
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
          {([-0.34, 0.34] as const).map((xRatio) => (
            <mesh
              key={xRatio}
              position={[
                structure.scoreboardWidth * xRatio,
                structure.scoreboardHeight / 2 +
                  structure.scoreboardSupportDrop / 2,
                0,
              ]}
            >
              <cylinderGeometry
                args={[0.09, 0.09, structure.scoreboardSupportDrop, 8]}
              />
              <meshStandardMaterial
                color="#dce2df"
                metalness={0.5}
                roughness={0.38}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
