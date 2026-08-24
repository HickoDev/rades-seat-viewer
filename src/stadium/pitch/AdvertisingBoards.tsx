import { useEffect, useMemo } from 'react';
import {
  BoxGeometry,
  CanvasTexture,
  MeshStandardMaterial,
  SRGBColorSpace,
} from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';

const boardDesigns = [
  { background: '#183f82', accent: '#58c9e8', label: 'RADÈS' },
  { background: '#5b287c', accent: '#e7b94d', label: 'TUNISIA' },
  { background: '#0e6b81', accent: '#f2f5ef', label: 'HAMMADI AGREBI' },
];

function createBoardMaterial(design: (typeof boardDesigns)[number]) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 192;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create advertising-board texture.');

  context.fillStyle = design.background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = design.accent;
  context.fillRect(0, 0, 22, canvas.height);
  context.fillRect(canvas.width - 22, 0, 22, canvas.height);
  context.font = `700 ${design.label.length > 10 ? 80 : 108}px Arial`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(design.label, canvas.width / 2, canvas.height / 2 + 4);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  const material = new MeshStandardMaterial({
    map: texture,
    emissive: design.background,
    emissiveIntensity: 0.08,
    roughness: 0.72,
  });
  return { material, texture };
}

function createRunPositions(
  runLength: number,
  segmentLength: number,
  gap: number,
) {
  const count = Math.max(
    1,
    Math.floor((runLength + gap) / (segmentLength + gap)),
  );
  const usedLength = count * segmentLength + (count - 1) * gap;
  return Array.from(
    { length: count },
    (_, index) =>
      -usedLength / 2 + segmentLength / 2 + index * (segmentLength + gap),
  );
}

export function AdvertisingBoards() {
  const { fieldFurniture, pitch } = radesStadiumConfig;
  const geometry = useMemo(
    () =>
      new BoxGeometry(
        fieldFurniture.advertisingBoardSegmentLength,
        fieldFurniture.advertisingBoardHeight,
        fieldFurniture.advertisingBoardDepth,
      ),
    [fieldFurniture],
  );
  const resources = useMemo(
    () => boardDesigns.map((design) => createBoardMaterial(design)),
    [],
  );
  const behindGoalPositions = useMemo(
    () =>
      createRunPositions(
        fieldFurniture.behindGoalRunLength,
        fieldFurniture.advertisingBoardSegmentLength,
        fieldFurniture.advertisingBoardGap,
      ),
    [fieldFurniture],
  );
  const sidelinePositions = useMemo(
    () =>
      createRunPositions(
        fieldFurniture.sidelineRunLength,
        fieldFurniture.advertisingBoardSegmentLength,
        fieldFurniture.advertisingBoardGap,
      ),
    [fieldFurniture],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      resources.forEach(({ material, texture }) => {
        material.dispose();
        texture.dispose();
      });
    },
    [geometry, resources],
  );

  return (
    <group name="pitch-side-advertising-hoardings">
      {([-1, 1] as const).flatMap((side) =>
        behindGoalPositions.map((offset, index) => (
          <mesh
            key={`goal-${side}-${index}`}
            geometry={geometry}
            material={resources[index % resources.length].material}
            position={[
              side * (pitch.length / 2 + fieldFurniture.behindGoalOffset),
              fieldFurniture.advertisingBoardHeight / 2,
              offset,
            ]}
            rotation={[0, Math.PI / 2, 0]}
          />
        )),
      )}
      {([-1, 1] as const).flatMap((side) =>
        sidelinePositions.map((offset, index) => (
          <mesh
            key={`sideline-${side}-${index}`}
            geometry={geometry}
            material={resources[(index + 1) % resources.length].material}
            position={[
              offset,
              fieldFurniture.advertisingBoardHeight / 2,
              side * (pitch.width / 2 + fieldFurniture.sidelineOffset),
            ]}
          />
        )),
      )}
    </group>
  );
}
