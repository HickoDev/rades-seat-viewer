import { useEffect, useMemo } from 'react';
import {
  CanvasTexture,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  SRGBColorSpace,
} from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';

function createTribuneSignMaterial() {
  const canvas = document.createElement('canvas');
  canvas.width = 1536;
  canvas.height = 192;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create honor-tribune sign.');

  const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, '#163f8a');
  gradient.addColorStop(0.5, '#257db2');
  gradient.addColorStop(1, '#163f8a');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#f5f7ef';
  context.font = '700 78px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(
    'STADE OLYMPIQUE  ·  HAMMADI AGREBI',
    canvas.width / 2,
    canvas.height / 2,
  );

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  const material = new MeshStandardMaterial({
    map: texture,
    emissive: '#174e8b',
    emissiveIntensity: 0.1,
    roughness: 0.58,
  });
  return { material, texture };
}

export function HonorPressTribune() {
  const { grandstand, tiers } = radesStadiumConfig;
  const upperTier = tiers.find((tier) => tier.id === 'upper') ?? tiers[1];
  const side = grandstand.side;
  const frontZ = side * (upperTier.startRadiusZ - grandstand.frontInset);
  const centerZ = frontZ + (side * grandstand.depth) / 2;
  const windowHeight = grandstand.height - grandstand.signBandHeight - 0.72;
  const windowWidth = grandstand.width / grandstand.windowBayCount;
  const shellMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#e4e0d2',
        roughness: 0.84,
      }),
    [],
  );
  const frameMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#e9eeeb',
        metalness: 0.38,
        roughness: 0.44,
      }),
    [],
  );
  const glassMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: '#4d849b',
        emissive: '#183c50',
        emissiveIntensity: 0.16,
        metalness: 0.05,
        opacity: 0.84,
        roughness: 0.24,
        transparent: true,
        transmission: 0,
      }),
    [],
  );
  const woodMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#7a4a27',
        roughness: 0.74,
      }),
    [],
  );
  const signResource = useMemo(() => createTribuneSignMaterial(), []);

  useEffect(
    () => () => {
      shellMaterial.dispose();
      frameMaterial.dispose();
      glassMaterial.dispose();
      woodMaterial.dispose();
      signResource.material.dispose();
      signResource.texture.dispose();
    },
    [frameMaterial, glassMaterial, shellMaterial, signResource, woodMaterial],
  );

  return (
    <group
      name="honor-and-press-tribune"
      userData={{
        officialCapacity: grandstand.officialCapacity,
        pressDeskCount: grandstand.pressDeskCount,
        dimensionsAreEstimates: true,
      }}
    >
      <mesh
        material={shellMaterial}
        position={[0, grandstand.baseHeight + grandstand.height / 2, centerZ]}
        userData={{
          shadowOccluder: true,
          occluderType: 'honor-press-tribune',
        }}
      >
        <boxGeometry
          args={[grandstand.width, grandstand.height, grandstand.depth]}
        />
      </mesh>

      {Array.from({ length: grandstand.windowBayCount }, (_, bayIndex) => {
        const x = -grandstand.width / 2 + windowWidth * (bayIndex + 0.5);
        return (
          <mesh
            key={bayIndex}
            material={glassMaterial}
            position={[
              x,
              grandstand.baseHeight + windowHeight / 2,
              frontZ - side * 0.045,
            ]}
          >
            <boxGeometry args={[windowWidth - 0.14, windowHeight, 0.08]} />
          </mesh>
        );
      })}

      {Array.from(
        { length: grandstand.windowBayCount + 1 },
        (_, frameIndex) => (
          <mesh
            key={frameIndex}
            material={frameMaterial}
            position={[
              -grandstand.width / 2 + windowWidth * frameIndex,
              grandstand.baseHeight + windowHeight / 2,
              frontZ - side * 0.095,
            ]}
          >
            <boxGeometry args={[0.1, windowHeight + 0.18, 0.12]} />
          </mesh>
        ),
      )}

      <mesh
        material={signResource.material}
        position={[
          0,
          grandstand.baseHeight +
            grandstand.height -
            grandstand.signBandHeight / 2,
          frontZ - side * 0.11,
        ]}
      >
        <boxGeometry
          args={[grandstand.width, grandstand.signBandHeight, 0.14]}
        />
      </mesh>

      <mesh
        material={woodMaterial}
        position={[
          0,
          grandstand.baseHeight - 0.08,
          frontZ - (side * grandstand.canopyDepth) / 2,
        ]}
      >
        <boxGeometry
          args={[grandstand.width * 0.42, 0.18, grandstand.canopyDepth]}
        />
      </mesh>
    </group>
  );
}
