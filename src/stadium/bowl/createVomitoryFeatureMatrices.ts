import { Matrix4, Quaternion, Vector3 } from 'three';

import type { StadiumConfig } from '../types/stadium.types';

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
    if (sectionIndex % tier.vomitoryEverySections !== 0) continue;

    const angle = ((sectionIndex + 0.5) / tier.sectionCount) * Math.PI * 2;
    const radiusX = tier.startRadiusX + tier.vomitoryRow * tier.rowDepth;
    const radiusZ = tier.startRadiusZ + tier.vomitoryRow * tier.rowDepth;
    const height =
      tier.baseHeight +
      tier.vomitoryRow * tier.rowHeight +
      tier.vomitoryHeight / 2;
    const rotation = new Quaternion().setFromAxisAngle(
      new Vector3(0, 1, 0),
      -angle + Math.PI / 2,
    );
    const portalTransform = new Matrix4().compose(
      new Vector3(Math.cos(angle) * radiusX, height, Math.sin(angle) * radiusZ),
      rotation,
      unitScale,
    );
    const frame = tier.vomitoryFrameThickness;
    const frameDepth = tier.vomitoryDepth * 0.22;

    panels.push(
      composePortalPart(
        portalTransform,
        [0, 0, tier.vomitoryDepth * 0.36],
        [tier.vomitoryWidth, tier.vomitoryHeight, tier.vomitoryDepth * 0.1],
      ),
    );
    floors.push(
      composePortalPart(
        portalTransform,
        [0, -tier.vomitoryHeight / 2 + frame * 0.2, 0],
        [tier.vomitoryWidth + frame * 2, frame * 0.4, tier.vomitoryDepth],
      ),
    );
    frames.push(
      composePortalPart(
        portalTransform,
        [-(tier.vomitoryWidth + frame) / 2, 0, 0],
        [frame, tier.vomitoryHeight + frame * 2, frameDepth],
      ),
      composePortalPart(
        portalTransform,
        [(tier.vomitoryWidth + frame) / 2, 0, 0],
        [frame, tier.vomitoryHeight + frame * 2, frameDepth],
      ),
      composePortalPart(
        portalTransform,
        [0, (tier.vomitoryHeight + frame) / 2, 0],
        [tier.vomitoryWidth + frame * 2, frame, frameDepth],
      ),
    );
    signs.push(
      composePortalPart(
        portalTransform,
        [0, tier.vomitoryHeight * 0.32, -frameDepth * 0.58],
        [tier.vomitoryWidth * 0.27, frame * 0.72, frame * 0.14],
      ),
    );
  }

  return { floors, frames, panels, signs };
}
