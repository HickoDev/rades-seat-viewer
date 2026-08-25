import { Matrix4, Quaternion, Vector3 } from 'three';

import type { StadiumConfig } from '../types/stadium.types';
import { getTierAccessOpening } from './tierAccess';

type TierConfig = StadiumConfig['tiers'][number];

const unitScale = new Vector3(1, 1, 1);
const unitRotation = new Quaternion();

function composePortalPart(
  portalTransform: Matrix4,
  position: [number, number, number],
  scale: [number, number, number],
) {
  return portalTransform
    .clone()
    .multiply(
      new Matrix4().compose(
        new Vector3(...position),
        unitRotation,
        new Vector3(...scale),
      ),
    );
}

export function createVomitoryFeatureMatrices(tier: TierConfig) {
  const panels: Matrix4[] = [];
  const floors: Matrix4[] = [];
  const frames: Matrix4[] = [];
  const signs: Matrix4[] = [];

  for (
    let sectionIndex = 0;
    sectionIndex < tier.sectionCount;
    sectionIndex += 1
  ) {
    const opening = getTierAccessOpening(tier, sectionIndex);
    if (!opening) continue;

    const angle = ((sectionIndex + 0.5) / tier.sectionCount) * Math.PI * 2;
    const radiusX = tier.startRadiusX + opening.row * tier.rowDepth;
    const radiusZ = tier.startRadiusZ + opening.row * tier.rowDepth;
    const height =
      tier.baseHeight + opening.row * tier.rowHeight + opening.height / 2;
    const rotation = new Quaternion().setFromAxisAngle(
      new Vector3(0, 1, 0),
      -angle + Math.PI / 2,
    );
    const portalTransform = new Matrix4().compose(
      new Vector3(Math.cos(angle) * radiusX, height, Math.sin(angle) * radiusZ),
      rotation,
      unitScale,
    );
    const frame = opening.frameThickness;
    const frameDepth = opening.depth * 0.22;

    panels.push(
      composePortalPart(
        portalTransform,
        [0, 0, opening.depth * 0.36],
        [opening.width, opening.height, opening.depth * 0.1],
      ),
    );
    floors.push(
      composePortalPart(
        portalTransform,
        [0, -opening.height / 2 + frame * 0.2, 0],
        [opening.width + frame * 2, frame * 0.4, opening.depth],
      ),
    );
    frames.push(
      composePortalPart(
        portalTransform,
        [-(opening.width + frame) / 2, 0, 0],
        [frame, opening.height + frame * 2, frameDepth],
      ),
      composePortalPart(
        portalTransform,
        [(opening.width + frame) / 2, 0, 0],
        [frame, opening.height + frame * 2, frameDepth],
      ),
      composePortalPart(
        portalTransform,
        [0, (opening.height + frame) / 2, 0],
        [opening.width + frame * 2, frame, frameDepth],
      ),
    );
    signs.push(
      composePortalPart(
        portalTransform,
        [0, opening.height * 0.32, -frameDepth * 0.58],
        [opening.width * 0.27, frame * 0.72, frame * 0.14],
      ),
    );
  }

  return { floors, frames, panels, signs };
}
