import type { ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useState } from 'react';
import {
  BoxGeometry,
  CanvasTexture,
  MeshStandardMaterial,
  SRGBColorSpace,
} from 'three';

import { useReducedMotion } from '../../utils/useReducedMotion';
import { radesStadiumConfig } from '../config/radesStadiumConfig';
import {
  advertisingCampaignPhases,
  advertisingCampaigns,
  advertisingRotationIntervalMs,
  type AdvertisingCampaign,
} from './advertisingCampaigns';

function createBoardMaterial(design: AdvertisingCampaign, index: number) {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 240;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Unable to create advertising-board texture.');

  context.fillStyle = design.background;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.globalAlpha = 0.14;
  context.fillStyle = design.foreground;
  for (let x = 0; x < canvas.width; x += 16) {
    context.fillRect(x, 0, 1, canvas.height);
  }
  context.globalAlpha = 1;

  context.fillStyle = design.accent;
  context.fillRect(0, 0, 24, canvas.height);
  context.fillRect(48, 42, 104, 156);

  context.fillStyle = design.background;
  context.font = '900 47px Arial, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('HD', 100, 120);

  context.textAlign = 'left';
  context.fillStyle = design.accent;
  context.font = '800 23px Arial, sans-serif';
  context.fillText(design.eyebrow, 190, 48);

  context.fillStyle = design.foreground;
  context.font = '900 61px Arial, sans-serif';
  context.fillText(design.headline, 190, 115);

  context.globalAlpha = 0.82;
  context.font = '700 28px Arial, sans-serif';
  context.fillText(design.address, 190, 179);
  context.globalAlpha = 1;

  context.strokeStyle = design.accent;
  context.lineWidth = 3;
  context.strokeRect(1090, 72, 132, 96);
  context.fillStyle = design.foreground;
  context.font = '900 25px Arial, sans-serif';
  context.textAlign = 'center';
  context.fillText(`0${index + 1}`, 1156, 105);
  context.font = '800 19px Arial, sans-serif';
  context.fillText('VISIT', 1156, 139);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  const material = new MeshStandardMaterial({
    map: texture,
    emissive: design.background,
    emissiveMap: texture,
    emissiveIntensity: 0.32,
    roughness: 0.58,
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
  const { fieldFurniture, grandstand, pitch } = radesStadiumConfig;
  const prefersReducedMotion = useReducedMotion();
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
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
    () =>
      advertisingCampaigns.map((design, index) =>
        createBoardMaterial(design, index),
      ),
    [],
  );
  const edgeMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#17191b',
        metalness: 0.38,
        roughness: 0.5,
      }),
    [],
  );
  const materialSets = useMemo(
    () =>
      resources.map(({ material }) => [
        edgeMaterial,
        edgeMaterial,
        edgeMaterial,
        edgeMaterial,
        material,
        material,
      ]),
    [edgeMaterial, resources],
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
      edgeMaterial.dispose();
      resources.forEach(({ material, texture }) => {
        material.dispose();
        texture.dispose();
      });
    },
    [edgeMaterial, geometry, resources],
  );

  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = window.setInterval(() => {
      setActivePhaseIndex(
        (currentIndex) => (currentIndex + 1) % advertisingCampaignPhases.length,
      );
    }, advertisingRotationIntervalMs);

    return () => window.clearInterval(interval);
  }, [prefersReducedMotion]);

  useEffect(
    () => () => {
      document.body.style.cursor = '';
    },
    [],
  );

  const activeCampaignIds = advertisingCampaignPhases[activePhaseIndex];
  const getBoardCampaign = (boardIndex: number, side: -1 | 1) => {
    const sideOffset = side === 1 ? 1 : 0;
    const campaignId =
      activeCampaignIds[(boardIndex + sideOffset) % activeCampaignIds.length];
    const campaignIndex = advertisingCampaigns.findIndex(
      (campaign) => campaign.id === campaignId,
    );
    const campaign = advertisingCampaigns[campaignIndex];
    const materials = materialSets[campaignIndex];

    if (!campaign || !materials) {
      throw new Error(`Missing advertising campaign: ${campaignId}`);
    }

    return { campaign, materials };
  };
  const openCampaign = (
    event: ThreeEvent<MouseEvent>,
    campaign: AdvertisingCampaign,
  ) => {
    event.stopPropagation();
    window.open(campaign.href, '_blank', 'noopener,noreferrer');
  };
  const showLinkCursor = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    document.body.style.cursor = 'pointer';
  };
  const restoreCursor = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    document.body.style.cursor = '';
  };

  return (
    <group
      name="pitch-side-advertising-hoardings"
      userData={{
        activeCampaigns: [...activeCampaignIds],
      }}
    >
      {([-1, 1] as const).flatMap((side) =>
        behindGoalPositions.map((offset, index) => {
          const { campaign, materials } = getBoardCampaign(index, side);

          return (
            <mesh
              key={`goal-${side}-${index}`}
              geometry={geometry}
              material={materials}
              onClick={(event) => openCampaign(event, campaign)}
              onPointerOut={restoreCursor}
              onPointerOver={showLinkCursor}
              position={[
                side * (pitch.length / 2 + fieldFurniture.behindGoalOffset),
                fieldFurniture.advertisingBoardHeight / 2,
                offset,
              ]}
              rotation={[0, Math.PI / 2, 0]}
            />
          );
        }),
      )}
      {([-1, 1] as const).flatMap((side) =>
        sidelinePositions.map((offset, index) => {
          const intersectsPlayerRoute =
            side === grandstand.side &&
            Math.abs(offset) <
              grandstand.playerTunnelWidth / 2 +
                fieldFurniture.advertisingBoardSegmentLength / 2;
          if (intersectsPlayerRoute) return null;

          const { campaign, materials } = getBoardCampaign(index, side);

          return (
            <mesh
              key={`sideline-${side}-${index}`}
              geometry={geometry}
              material={materials}
              onClick={(event) => openCampaign(event, campaign)}
              onPointerOut={restoreCursor}
              onPointerOver={showLinkCursor}
              position={[
                offset,
                fieldFurniture.advertisingBoardHeight / 2,
                side * (pitch.width / 2 + fieldFurniture.sidelineOffset),
              ]}
            />
          );
        }),
      )}
    </group>
  );
}
