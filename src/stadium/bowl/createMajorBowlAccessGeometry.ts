import { BufferGeometry, Float32BufferAttribute } from 'three';

import {
  getStadiumPerimeterAngleForDistance,
  getStadiumPerimeterPoint,
} from '../geometry/stadiumPerimeter';
import type { StadiumConfig } from '../types/stadium.types';
import type { TierMajorCutout } from './tierAccess';

type TierConfig = StadiumConfig['tiers'][number];

type GeometryBuffers = {
  indices: number[];
  positions: number[];
};

function addQuad(
  buffers: GeometryBuffers,
  first: [number, number, number],
  second: [number, number, number],
  third: [number, number, number],
  fourth: [number, number, number],
) {
  const offset = buffers.positions.length / 3;
  buffers.positions.push(...first, ...second, ...third, ...fourth);
  buffers.indices.push(
    offset,
    offset + 2,
    offset + 1,
    offset + 1,
    offset + 2,
    offset + 3,
  );
}

function createGeometry(buffers: GeometryBuffers) {
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    'position',
    new Float32BufferAttribute(buffers.positions, 3),
  );
  geometry.setIndex(buffers.indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

function getRampHeight(tier: TierConfig, ratio: number) {
  const upperHeight = tier.baseHeight + tier.rowCount * tier.rowHeight;
  return 0.14 + ratio * (upperHeight - 0.14);
}

function getStripPoints(
  tier: TierConfig,
  cutout: TierMajorCutout,
  ratio: number,
  width: number,
) {
  const centerAngle = (cutout.boundaryIndex / tier.sectionCount) * Math.PI * 2;
  const extentX = tier.startRadiusX + ratio * tier.rowCount * tier.rowDepth;
  const extentZ = tier.startRadiusZ + ratio * tier.rowCount * tier.rowDepth;
  const halfAngle =
    getStadiumPerimeterAngleForDistance(width, extentX, extentZ) / 2;
  const left = getStadiumPerimeterPoint(
    centerAngle + halfAngle,
    extentX,
    extentZ,
  );
  const right = getStadiumPerimeterPoint(
    centerAngle - halfAngle,
    extentX,
    extentZ,
  );
  return {
    extentX,
    extentZ,
    left,
    right,
    y: getRampHeight(tier, ratio),
  };
}

export function createMajorBowlAccessGeometry(
  tier: TierConfig,
  cutout: TierMajorCutout,
  segments = 18,
) {
  const floor: GeometryBuffers = { indices: [], positions: [] };
  const shoulders: GeometryBuffers = { indices: [], positions: [] };
  const stepMarkings: GeometryBuffers = { indices: [], positions: [] };
  const walls: GeometryBuffers = { indices: [], positions: [] };

  for (let segment = 0; segment < segments; segment += 1) {
    const startRatio = segment / segments;
    const endRatio = (segment + 1) / segments;
    const startAccess = getStripPoints(
      tier,
      cutout,
      startRatio,
      cutout.accessWidth,
    );
    const endAccess = getStripPoints(
      tier,
      cutout,
      endRatio,
      cutout.accessWidth,
    );
    const startFull = getStripPoints(tier, cutout, startRatio, cutout.width);
    const endFull = getStripPoints(tier, cutout, endRatio, cutout.width);

    addQuad(
      floor,
      [startAccess.left.x, startAccess.y, startAccess.left.z],
      [startAccess.right.x, startAccess.y, startAccess.right.z],
      [endAccess.left.x, endAccess.y, endAccess.left.z],
      [endAccess.right.x, endAccess.y, endAccess.right.z],
    );

    addQuad(
      shoulders,
      [startFull.left.x, startFull.y - 0.035, startFull.left.z],
      [startAccess.left.x, startAccess.y - 0.035, startAccess.left.z],
      [endFull.left.x, endFull.y - 0.035, endFull.left.z],
      [endAccess.left.x, endAccess.y - 0.035, endAccess.left.z],
    );
    addQuad(
      shoulders,
      [startAccess.right.x, startAccess.y - 0.035, startAccess.right.z],
      [startFull.right.x, startFull.y - 0.035, startFull.right.z],
      [endAccess.right.x, endAccess.y - 0.035, endAccess.right.z],
      [endFull.right.x, endFull.y - 0.035, endFull.right.z],
    );

    for (const side of ['left', 'right'] as const) {
      addQuad(
        walls,
        [startFull[side].x, startFull.y, startFull[side].z],
        [endFull[side].x, endFull.y, endFull[side].z],
        [startFull[side].x, startFull.y + cutout.wallHeight, startFull[side].z],
        [endFull[side].x, endFull.y + cutout.wallHeight, endFull[side].z],
      );
    }

    if (segment > 0 && segment % 2 === 0) {
      const markerStart = getStripPoints(
        tier,
        cutout,
        startRatio - 0.004,
        cutout.accessWidth,
      );
      const markerEnd = getStripPoints(
        tier,
        cutout,
        startRatio + 0.004,
        cutout.accessWidth,
      );
      addQuad(
        stepMarkings,
        [markerStart.left.x, markerStart.y + 0.025, markerStart.left.z],
        [markerStart.right.x, markerStart.y + 0.025, markerStart.right.z],
        [markerEnd.left.x, markerEnd.y + 0.025, markerEnd.left.z],
        [markerEnd.right.x, markerEnd.y + 0.025, markerEnd.right.z],
      );
    }
  }

  return {
    floor: createGeometry(floor),
    shoulders: createGeometry(shoulders),
    stepMarkings: createGeometry(stepMarkings),
    walls: createGeometry(walls),
  };
}
