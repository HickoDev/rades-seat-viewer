import { Matrix4, Quaternion, Vector3 } from 'three';

import type { StadiumConfig } from '../types/stadium.types';
import { getStadiumPerimeterFrame } from '../geometry/stadiumPerimeter';

type TierConfig = StadiumConfig['tiers'][number];
type BowlDetails = StadiumConfig['bowlDetails'];

export type ConcourseGeometry = {
  bottom: number;
  height: number;
  radiusX: number;
  radiusZ: number;
};

function getConcourseGeometry(
  lowerTier: TierConfig,
  upperTier: TierConfig,
  details: BowlDetails,
): ConcourseGeometry {
  const bottom =
    lowerTier.baseHeight + lowerTier.rowCount * lowerTier.rowHeight;
  return {
    bottom,
    height: Math.max(upperTier.baseHeight - bottom, 0.5),
    radiusX: upperTier.startRadiusX - details.concourseWallInset,
    radiusZ: upperTier.startRadiusZ - details.concourseWallInset,
  };
}

export function createConcourseFeatureMatrices(
  upperTier: TierConfig,
  lowerTier: TierConfig,
  details: BowlDetails,
) {
  const concourse = getConcourseGeometry(lowerTier, upperTier, details);
  const portalBase =
    concourse.bottom +
    Math.max((concourse.height - details.concoursePortalHeight) / 2, 0);
  const portals: Matrix4[] = [];
  const portalFrames: Matrix4[] = [];
  const signs: Matrix4[] = [];
  const lights: Matrix4[] = [];

  for (
    let sectionIndex = 0;
    sectionIndex < upperTier.sectionCount;
    sectionIndex += 1
  ) {
    const angle = ((sectionIndex + 0.5) / upperTier.sectionCount) * Math.PI * 2;
    const inwardOffset = details.concoursePortalDepth * 0.65;
    const portalFrame = getStadiumPerimeterFrame(
      angle,
      concourse.radiusX - inwardOffset,
      concourse.radiusZ - inwardOffset,
    );
    const rotationY = -Math.atan2(portalFrame.tangentZ, portalFrame.tangentX);
    const rotation = new Quaternion().setFromAxisAngle(
      new Vector3(0, 1, 0),
      rotationY,
    );
    const position = new Vector3(
      portalFrame.x,
      portalBase + details.concoursePortalHeight / 2,
      portalFrame.z,
    );
    portals.push(
      new Matrix4().compose(
        position,
        rotation,
        new Vector3(
          details.concoursePortalWidth,
          details.concoursePortalHeight,
          details.concoursePortalDepth,
        ),
      ),
    );

    const frameThickness = details.concoursePortalFrameThickness;
    const frameDepth = details.concoursePortalDepth * 1.8;
    portalFrames.push(
      new Matrix4().compose(
        position,
        rotation,
        new Vector3(
          details.concoursePortalWidth + frameThickness * 2,
          details.concoursePortalHeight + frameThickness * 2,
          frameDepth,
        ),
      ),
    );

    const signPoint = getStadiumPerimeterFrame(
      angle,
      concourse.radiusX - inwardOffset * 1.2,
      concourse.radiusZ - inwardOffset * 1.2,
    );
    signs.push(
      new Matrix4().compose(
        new Vector3(
          signPoint.x,
          portalBase + details.concoursePortalHeight + frameThickness * 1.8,
          signPoint.z,
        ),
        rotation,
        new Vector3(
          details.concourseSignWidth,
          details.concourseSignHeight,
          details.concoursePortalDepth * 0.32,
        ),
      ),
    );

    const lightPoint = getStadiumPerimeterFrame(
      angle,
      concourse.radiusX - inwardOffset * 1.5,
      concourse.radiusZ - inwardOffset * 1.5,
    );
    lights.push(
      new Matrix4().compose(
        new Vector3(
          lightPoint.x,
          concourse.bottom + concourse.height * 0.88,
          lightPoint.z,
        ),
        rotation,
        new Vector3(
          details.concoursePortalWidth * 0.52,
          details.concourseSignHeight * 0.42,
          details.concoursePortalDepth * 0.55,
        ),
      ),
    );
  }

  return { concourse, lights, portalFrames, portals, signs };
}
