import { useEffect, useMemo } from 'react';
import { DoubleSide, Shape, ShapeGeometry } from 'three';

import { radesStadiumConfig } from '../config/radesStadiumConfig';

function createArchedPanelGeometry(width: number, height: number) {
  const halfWidth = width / 2;
  const springHeight = height - width / 2;
  const shape = new Shape();
  shape.moveTo(-halfWidth, 0);
  shape.lineTo(halfWidth, 0);
  shape.lineTo(halfWidth, springHeight);
  shape.quadraticCurveTo(halfWidth, height, 0, height);
  shape.quadraticCurveTo(-halfWidth, height, -halfWidth, springHeight);
  shape.closePath();
  return new ShapeGeometry(shape, 18);
}

export function MainEntranceFacade() {
  const { exterior, roof, structure } = radesStadiumConfig;
  const side = exterior.mainEntranceSide;
  const centerZ =
    side *
    (roof.outerRadiusZ +
      structure.exteriorRadiusOffset +
      exterior.mainEntranceDepth / 2);
  const frontZ =
    centerZ + (side * exterior.mainEntranceDepth) / 2 + side * 0.04;
  const windowGeometry = useMemo(
    () =>
      createArchedPanelGeometry(
        exterior.archedWindowWidth,
        exterior.archedWindowHeight,
      ),
    [exterior],
  );
  const centralArchGeometry = useMemo(
    () =>
      createArchedPanelGeometry(
        exterior.centralTowerWidth * 0.58,
        exterior.centralTowerHeight * 0.56,
      ),
    [exterior],
  );
  const windowPositions = useMemo(() => {
    const perWing = Math.floor(exterior.archedWindowCount / 2);
    const wingWidth =
      (exterior.mainEntranceWidth - exterior.centralTowerWidth) / 2;
    const spacing = wingWidth / (perWing + 1);
    return [-1, 1].flatMap((wingSide) =>
      Array.from(
        { length: perWing },
        (_, index) =>
          wingSide * (exterior.centralTowerWidth / 2 + spacing * (index + 1)),
      ),
    );
  }, [exterior]);

  useEffect(
    () => () => {
      windowGeometry.dispose();
      centralArchGeometry.dispose();
    },
    [centralArchGeometry, windowGeometry],
  );

  return (
    <group
      name="rades-ceremonial-main-entrance"
      userData={{ dimensionsAreEstimates: true }}
    >
      <mesh
        position={[0, exterior.wingHeight / 2, centerZ]}
        userData={{
          shadowOccluder: true,
          occluderType: 'main-entrance-facade',
        }}
      >
        <boxGeometry
          args={[
            exterior.mainEntranceWidth,
            exterior.wingHeight,
            exterior.mainEntranceDepth,
          ]}
        />
        <meshStandardMaterial color="#ded8c6" roughness={0.9} />
      </mesh>
      <mesh
        position={[0, exterior.centralTowerHeight / 2, centerZ + side * 0.2]}
      >
        <boxGeometry
          args={[
            exterior.centralTowerWidth,
            exterior.centralTowerHeight,
            exterior.mainEntranceDepth + 0.4,
          ]}
        />
        <meshStandardMaterial color="#ebe5d4" roughness={0.88} />
      </mesh>

      {windowPositions.map((x, index) => (
        <mesh
          key={index}
          geometry={windowGeometry}
          position={[x, exterior.wingHeight * 0.2, frontZ]}
        >
          <meshStandardMaterial
            color="#214b82"
            emissive="#102b53"
            emissiveIntensity={0.12}
            metalness={0.22}
            roughness={0.3}
            side={DoubleSide}
          />
        </mesh>
      ))}
      <mesh
        geometry={centralArchGeometry}
        position={[0, 0, frontZ + side * 0.24]}
      >
        <meshStandardMaterial
          color="#173a65"
          emissive="#0c203e"
          emissiveIntensity={0.14}
          metalness={0.24}
          roughness={0.28}
          side={DoubleSide}
        />
      </mesh>

      <mesh
        position={[
          0,
          exterior.wingHeight - exterior.blueTrimHeight / 2,
          frontZ + side * 0.08,
        ]}
      >
        <boxGeometry
          args={[exterior.mainEntranceWidth, exterior.blueTrimHeight, 0.18]}
        />
        <meshStandardMaterial color="#1770a8" roughness={0.64} />
      </mesh>
      <mesh position={[0, exterior.wingHeight * 0.72, frontZ + side * 0.09]}>
        <boxGeometry
          args={[exterior.mainEntranceWidth, exterior.yellowBandHeight, 0.2]}
        />
        <meshStandardMaterial color="#d8b33d" roughness={0.7} />
      </mesh>
      {Array.from({ length: 9 }, (_, index) => (
        <mesh
          key={index}
          position={[
            -exterior.mainEntranceWidth * 0.4 +
              (index * exterior.mainEntranceWidth * 0.8) / 8,
            exterior.wingHeight * 0.72,
            frontZ + side * 0.22,
          ]}
          rotation={[0, 0, Math.PI / 4]}
        >
          <boxGeometry
            args={[
              exterior.yellowBandHeight * 0.34,
              exterior.yellowBandHeight * 0.34,
              0.08,
            ]}
          />
          <meshStandardMaterial color="#1a63a0" roughness={0.58} />
        </mesh>
      ))}
    </group>
  );
}
