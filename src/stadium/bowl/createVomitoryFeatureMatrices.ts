import { Matrix4, Quaternion, Vector3 } from 'three';

import { getStadiumPerimeterFrame } from '../geometry/stadiumPerimeter';
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

/**
 * Creates recessed, traversable-looking tier passages. Local negative Z runs
 * from the seating face toward the rear concourse, so nothing is placed in
 * front of the chairs or across the opening mouth.
 */
export function createVomitoryFeatureMatrices(tier: TierConfig) {
  const backWalls: Matrix4[] = [];
  const ceilings: Matrix4[] = [];
  const floors: Matrix4[] = [];
  const frames: Matrix4[] = [];
  const lights: Matrix4[] = [];
  const signs: Matrix4[] = [];
  const walls: Matrix4[] = [];

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
    const perimeter = getStadiumPerimeterFrame(angle, radiusX, radiusZ);
    const inwardRotation = Math.atan2(-perimeter.x, -perimeter.z);
    const rotation = new Quaternion().setFromAxisAngle(
      new Vector3(0, 1, 0),
      inwardRotation,
    );
    const portalTransform = new Matrix4().compose(
      new Vector3(perimeter.x, height, perimeter.z),
      rotation,
      unitScale,
    );
    const frame = opening.frameThickness;
    const frameDepth = Math.max(frame * 0.9, 0.18);
    const clearedRows = Math.ceil(opening.height / tier.rowHeight);
    const passageDepth = Math.max(
      opening.depth,
      clearedRows * tier.rowDepth + tier.rowDepth * 0.35,
    );
    const passageCenterZ = -passageDepth / 2;
    const backWallDepth = Math.max(frame * 0.52, 0.12);
    const rearFrameZ = -passageDepth + frameDepth / 2;
    const sideWallHeight = Math.max(0.82, opening.height * 0.34);
    const sideWallCenterY =
      -opening.height / 2 + sideWallHeight / 2 + frame * 0.22;

    // Close the rear of the recess so the opening reads as an entrance into
    // the internal concourse, never as a sightline through to the exterior.
    backWalls.push(
      composePortalPart(
        portalTransform,
        [0, 0, -passageDepth + backWallDepth / 2],
        [opening.width, opening.height, backWallDepth],
      ),
    );

    floors.push(
      composePortalPart(
        portalTransform,
        [0, -opening.height / 2 + frame * 0.22, passageCenterZ],
        [opening.width + frame * 2, frame * 0.44, passageDepth],
      ),
    );
    ceilings.push(
      composePortalPart(
        portalTransform,
        [0, opening.height / 2 + frame * 0.3, rearFrameZ],
        [opening.width + frame * 2, frame * 0.6, frameDepth * 2],
      ),
    );
    for (const side of [-1, 1] as const) {
      walls.push(
        composePortalPart(
          portalTransform,
          [
            side * (opening.width / 2 + frame / 2),
            sideWallCenterY,
            passageCenterZ,
          ],
          [frame, sideWallHeight, passageDepth],
        ),
      );
    }

    // The tall portal frame belongs at the recessed concourse door. Keeping
    // the front of the cut open prevents a concrete box from blocking the
    // sightline of spectators seated beside it.
    frames.push(
      composePortalPart(
        portalTransform,
        [-(opening.width + frame) / 2, 0, rearFrameZ],
        [frame, opening.height + frame * 2, frameDepth],
      ),
      composePortalPart(
        portalTransform,
        [(opening.width + frame) / 2, 0, rearFrameZ],
        [frame, opening.height + frame * 2, frameDepth],
      ),
      composePortalPart(
        portalTransform,
        [0, (opening.height + frame) / 2, rearFrameZ],
        [opening.width + frame * 2, frame, frameDepth],
      ),
    );
    signs.push(
      composePortalPart(
        portalTransform,
        [0, opening.height * 0.32, rearFrameZ + frameDepth * 0.62],
        [opening.width * 0.27, frame * 0.72, frame * 0.14],
      ),
    );
    lights.push(
      composePortalPart(
        portalTransform,
        [
          0,
          opening.height / 2 - frame * 0.82,
          -passageDepth + frameDepth * 1.8,
        ],
        [opening.width * 0.38, frame * 0.18, frame * 0.34],
      ),
    );
  }

  return { backWalls, ceilings, floors, frames, lights, signs, walls };
}
