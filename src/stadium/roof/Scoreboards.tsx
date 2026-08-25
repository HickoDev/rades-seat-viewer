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
              color="#e2c641"
              metalness={0.26}
              roughness={0.56}
            />
          </mesh>
          <mesh
            position={[0, -structure.scoreboardHeight / 2 - 0.38, 0]}
            receiveShadow
          >
            <boxGeometry
              args={[
                structure.scoreboardWidth + structure.scoreboardDeckWidthMargin,
                0.22,
                structure.scoreboardDeckDepth,
              ]}
            />
            <meshStandardMaterial
              color="#68706d"
              metalness={0.42}
              roughness={0.58}
            />
          </mesh>
          {([-1, 1] as const).map((deckSide) => (
            <mesh
              key={`deck-rail-${deckSide}`}
              position={[
                0,
                -structure.scoreboardHeight / 2 -
                  0.38 +
                  structure.scoreboardDeckRailHeight,
                (deckSide * structure.scoreboardDeckDepth) / 2,
              ]}
            >
              <boxGeometry
                args={[
                  structure.scoreboardWidth +
                    structure.scoreboardDeckWidthMargin,
                  0.07,
                  0.07,
                ]}
              />
              <meshStandardMaterial
                color="#d9dfdc"
                metalness={0.56}
                roughness={0.38}
              />
            </mesh>
          ))}
          {Array.from({ length: 7 }, (_, postIndex) => postIndex).flatMap(
            (postIndex) =>
              ([-1, 1] as const).map((deckSide) => (
                <mesh
                  key={`deck-post-${postIndex}-${deckSide}`}
                  position={[
                    -(
                      structure.scoreboardWidth +
                      structure.scoreboardDeckWidthMargin
                    ) /
                      2 +
                      (postIndex *
                        (structure.scoreboardWidth +
                          structure.scoreboardDeckWidthMargin)) /
                        6,
                    -structure.scoreboardHeight / 2 -
                      0.38 +
                      structure.scoreboardDeckRailHeight / 2,
                    (deckSide * structure.scoreboardDeckDepth) / 2,
                  ]}
                >
                  <cylinderGeometry
                    args={[0.035, 0.035, structure.scoreboardDeckRailHeight, 6]}
                  />
                  <meshStandardMaterial
                    color="#d9dfdc"
                    metalness={0.56}
                    roughness={0.38}
                  />
                </mesh>
              )),
          )}
          <mesh
            material={display.material}
            position={[0, 0, structure.scoreboardDepth / 2 + 0.03]}
          >
            <planeGeometry
              args={[structure.scoreboardWidth, structure.scoreboardHeight]}
            />
          </mesh>
          {([-0.42, -0.28, 0.28, 0.42] as const).map((xRatio) => (
            <mesh
              key={xRatio}
              position={[
                structure.scoreboardWidth * xRatio,
                structure.scoreboardHeight / 2 +
                  structure.scoreboardSupportDrop / 2,
                0,
              ]}
              rotation={[0, 0, xRatio < 0 ? -0.24 : 0.24]}
            >
              <boxGeometry
                args={[0.13, structure.scoreboardSupportDrop * 1.08, 0.13]}
              />
              <meshStandardMaterial
                color="#222a2b"
                metalness={0.58}
                roughness={0.42}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
