import { useEffect, useMemo } from 'react';
import {
  CanvasTexture,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  SRGBColorSpace,
} from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';
import {
  createGrandstandFacilityLayout,
  type GrandstandFacilityVolume,
} from './grandstandLayout';

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
  context.font = '700 66px Arial';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(
    "TRIBUNE D'HONNEUR  ·  منصة شرفية",
    canvas.width / 2,
    canvas.height / 2,
  );

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return {
    texture,
    material: new MeshStandardMaterial({
      map: texture,
      emissive: '#174e8b',
      emissiveIntensity: 0.12,
      roughness: 0.58,
    }),
  };
}

type FacilityMaterials = {
  shell: MeshStandardMaterial;
  frame: MeshStandardMaterial;
  glass: MeshPhysicalMaterial;
  core: MeshStandardMaterial;
  accent: MeshStandardMaterial;
};

function FacilityVolume({
  facility,
  frontZ,
  materials,
  side,
}: {
  facility: GrandstandFacilityVolume;
  frontZ: number;
  materials: FacilityMaterials;
  side: -1 | 1;
}) {
  const isServiceCore = facility.kind === 'service-core';
  const windowHeight = Math.max(1.8, facility.height - 1.25);
  const windowWidth = facility.width / facility.windowBayCount;
  const centerZ = frontZ + (side * facility.depth) / 2;

  return (
    <group name={facility.id}>
      <mesh
        material={isServiceCore ? materials.core : materials.shell}
        position={[
          facility.centerX,
          facility.baseHeight + facility.height / 2,
          centerZ,
        ]}
        userData={{
          shadowOccluder: true,
          occluderType: `grandstand-${facility.kind}`,
        }}
      >
        <boxGeometry args={[facility.width, facility.height, facility.depth]} />
      </mesh>

      {!isServiceCore &&
        Array.from({ length: facility.windowBayCount }, (_, bayIndex) => (
          <mesh
            key={bayIndex}
            material={materials.glass}
            position={[
              facility.centerX -
                facility.width / 2 +
                windowWidth * (bayIndex + 0.5),
              facility.baseHeight + windowHeight / 2 + 0.32,
              frontZ - side * 0.065,
            ]}
          >
            <boxGeometry args={[windowWidth - 0.16, windowHeight, 0.1]} />
          </mesh>
        ))}

      {!isServiceCore &&
        Array.from({ length: facility.windowBayCount + 1 }, (_, frameIndex) => (
          <mesh
            key={`frame-${frameIndex}`}
            material={materials.frame}
            position={[
              facility.centerX - facility.width / 2 + windowWidth * frameIndex,
              facility.baseHeight + windowHeight / 2 + 0.32,
              frontZ - side * 0.12,
            ]}
          >
            <boxGeometry args={[0.1, windowHeight + 0.18, 0.13]} />
          </mesh>
        ))}

      {isServiceCore && (
        <>
          <mesh
            material={materials.glass}
            position={[
              facility.centerX,
              facility.baseHeight + facility.height * 0.7,
              frontZ - side * 0.075,
            ]}
          >
            <boxGeometry
              args={[facility.width * 0.34, facility.height * 0.34, 0.1]}
            />
          </mesh>
          <mesh
            material={materials.accent}
            position={[
              facility.centerX,
              facility.baseHeight + 1.2,
              frontZ - side * 0.08,
            ]}
          >
            <boxGeometry args={[facility.width * 0.48, 2.4, 0.12]} />
          </mesh>
          {[-0.48, 0.48].map((rotationZ, index) => (
            <mesh
              key={rotationZ}
              material={materials.frame}
              position={[
                facility.centerX,
                facility.baseHeight + 3.2 + index * 1.4,
                frontZ - side * 0.16,
              ]}
              rotation={[0, 0, rotationZ]}
            >
              <boxGeometry args={[facility.width * 0.72, 0.1, 0.12]} />
            </mesh>
          ))}
        </>
      )}

      <mesh
        material={materials.frame}
        position={[
          facility.centerX,
          facility.baseHeight + facility.height + 0.12,
          centerZ,
        ]}
      >
        <boxGeometry
          args={[facility.width + 0.32, 0.24, facility.depth + 0.3]}
        />
      </mesh>
    </group>
  );
}

function ContinuousGrandstandFacade({
  frontZ,
  materials,
  side,
}: {
  frontZ: number;
  materials: FacilityMaterials;
  side: -1 | 1;
}) {
  const { grandstand } = radesStadiumConfig;
  const bayWidth = grandstand.width / grandstand.windowBayCount;
  const centerZ = frontZ + (side * grandstand.depth) / 2;

  return (
    <group name="continuous-main-stand-facade">
      <mesh
        material={materials.shell}
        position={[0, grandstand.baseHeight + grandstand.height / 2, centerZ]}
        userData={{
          shadowOccluder: true,
          occluderType: 'continuous-grandstand-facade',
        }}
      >
        <boxGeometry
          args={[grandstand.width, grandstand.height, grandstand.depth]}
        />
      </mesh>

      {Array.from({ length: grandstand.facadeLevelCount }, (_, levelIndex) =>
        Array.from({ length: grandstand.windowBayCount }, (_, bayIndex) => (
          <mesh
            key={`${levelIndex}:${bayIndex}`}
            material={materials.glass}
            position={[
              -grandstand.width / 2 + bayWidth * (bayIndex + 0.5),
              grandstand.baseHeight +
                0.68 +
                levelIndex * grandstand.facadeLevelSpacing,
              frontZ - side * 0.065,
            ]}
          >
            <boxGeometry
              args={[bayWidth - 0.42, grandstand.facadeWindowHeight, 0.1]}
            />
          </mesh>
        )),
      )}

      {Array.from(
        { length: grandstand.facadeLevelCount - 1 },
        (_, levelIndex) => (
          <mesh
            key={levelIndex}
            material={materials.frame}
            position={[
              0,
              grandstand.baseHeight +
                1.38 +
                levelIndex * grandstand.facadeLevelSpacing,
              frontZ - side * 0.095,
            ]}
          >
            <boxGeometry args={[grandstand.width, 0.12, 0.14]} />
          </mesh>
        ),
      )}

      <mesh
        material={materials.frame}
        position={[
          0,
          grandstand.baseHeight + grandstand.height + 0.16,
          centerZ,
        ]}
      >
        <boxGeometry
          args={[grandstand.width + 0.5, 0.32, grandstand.depth + 0.36]}
        />
      </mesh>
    </group>
  );
}

export function HonorPressTribune() {
  const { grandstand, tiers } = radesStadiumConfig;
  const upperTier = tiers.find((tier) => tier.id === 'upper') ?? tiers[1];
  const side = grandstand.side;
  const frontZ = side * (upperTier.startRadiusZ - grandstand.frontInset);
  const facilities = useMemo(
    () => createGrandstandFacilityLayout(grandstand),
    [grandstand],
  );
  const materials = useMemo<FacilityMaterials>(
    () => ({
      shell: new MeshStandardMaterial({ color: '#ddd9cc', roughness: 0.86 }),
      frame: new MeshStandardMaterial({
        color: '#eef1ed',
        metalness: 0.32,
        roughness: 0.46,
      }),
      glass: new MeshPhysicalMaterial({
        color: '#477b92',
        emissive: '#173a4b',
        emissiveIntensity: 0.15,
        opacity: 0.86,
        roughness: 0.22,
        transparent: true,
      }),
      core: new MeshStandardMaterial({ color: '#c9c6bb', roughness: 0.92 }),
      accent: new MeshStandardMaterial({
        color: '#245f91',
        emissive: '#143b5e',
        emissiveIntensity: 0.12,
        roughness: 0.58,
      }),
    }),
    [],
  );
  const deskMaterial = useMemo(
    () => new MeshStandardMaterial({ color: '#744624', roughness: 0.76 }),
    [],
  );
  const sign = useMemo(() => createTribuneSignMaterial(), []);

  useEffect(
    () => () => {
      Object.values(materials).forEach((material) => material.dispose());
      deskMaterial.dispose();
      sign.material.dispose();
      sign.texture.dispose();
    },
    [deskMaterial, materials, sign],
  );

  return (
    <group
      name="honor-press-and-control-complex"
      userData={{
        officialCapacity: grandstand.officialCapacity,
        pressDeskCount: grandstand.pressDeskCount,
        dimensionsAreEstimates: true,
      }}
    >
      <ContinuousGrandstandFacade
        frontZ={frontZ}
        materials={materials}
        side={side}
      />

      {facilities.map((facility) => (
        <FacilityVolume
          key={facility.id}
          facility={facility}
          frontZ={frontZ}
          materials={materials}
          side={side}
        />
      ))}

      <mesh
        material={deskMaterial}
        position={[
          0,
          grandstand.baseHeight - 0.08,
          frontZ - (side * grandstand.balconyDepth) / 2,
        ]}
      >
        <boxGeometry args={[grandstand.width, 0.18, grandstand.balconyDepth]} />
      </mesh>
      <mesh
        material={materials.frame}
        position={[
          0,
          grandstand.baseHeight + grandstand.balconyRailHeight,
          frontZ - side * grandstand.balconyDepth,
        ]}
      >
        <boxGeometry args={[grandstand.width, 0.08, 0.08]} />
      </mesh>
      {Array.from({ length: 25 }, (_, postIndex) => (
        <mesh
          key={postIndex}
          material={materials.frame}
          position={[
            -grandstand.width / 2 + (postIndex * grandstand.width) / 24,
            grandstand.baseHeight + grandstand.balconyRailHeight / 2,
            frontZ - side * grandstand.balconyDepth,
          ]}
        >
          <cylinderGeometry
            args={[0.035, 0.035, grandstand.balconyRailHeight, 6]}
          />
        </mesh>
      ))}

      {([-1, 1] as const).flatMap((pressSide) =>
        Array.from({ length: 8 }, (_, deskIndex) => (
          <mesh
            key={`${pressSide}:${deskIndex}`}
            material={deskMaterial}
            position={[
              pressSide *
                (grandstand.centralSuiteWidth / 2 +
                  grandstand.suiteGap +
                  ((deskIndex + 0.5) / 8) * grandstand.pressSuiteWidth),
              grandstand.baseHeight + 0.38,
              frontZ - side * grandstand.balconyDepth * 0.55,
            ]}
          >
            <boxGeometry args={[grandstand.pressSuiteWidth / 9, 0.12, 0.58]} />
          </mesh>
        )),
      )}

      <mesh
        material={sign.material}
        position={[
          0,
          grandstand.baseHeight + grandstand.centralSuiteHeight - 0.5,
          frontZ - side * 0.16,
        ]}
      >
        <boxGeometry
          args={[
            grandstand.centralSuiteWidth - 0.6,
            grandstand.signBandHeight,
            0.14,
          ]}
        />
      </mesh>
    </group>
  );
}
