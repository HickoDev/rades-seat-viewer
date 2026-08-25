import { Path, Shape, ShapeGeometry, Vector2 } from 'three';

import type { StadiumConfig } from '../types/stadium.types';
import {
  getStadiumPerimeterAngleForDistance,
  getStadiumPerimeterPoint,
} from '../geometry/stadiumPerimeter';

type TierConfig = StadiumConfig['tiers'][number];

function toShapePoint(angle: number, extentX: number, extentZ: number) {
  const point = getStadiumPerimeterPoint(angle, extentX, extentZ);
  // The geometry is rotated onto XZ by its caller, so negate Z here to keep
  // the configured stadium angle after that rotation.
  return new Vector2(point.x, -point.z);
}

function createCutoutPath(
  tier: TierConfig,
  boundaryIndex: number,
  width: number,
) {
  const centerAngle = (boundaryIndex / tier.sectionCount) * Math.PI * 2;
  const innerExtentX = tier.startRadiusX - 0.25;
  const innerExtentZ = tier.startRadiusZ - 0.25;
  const outerExtentX =
    tier.startRadiusX + tier.rowCount * tier.rowDepth + tier.walkwayWidth + 0.5;
  const outerExtentZ =
    tier.startRadiusZ + tier.rowCount * tier.rowDepth + tier.walkwayWidth + 0.5;
  const innerHalfAngle =
    getStadiumPerimeterAngleForDistance(width, innerExtentX, innerExtentZ) / 2;
  const outerHalfAngle =
    getStadiumPerimeterAngleForDistance(width, outerExtentX, outerExtentZ) / 2;
  const points: Vector2[] = [];
  const arcSegments = 6;

  for (let index = 0; index <= arcSegments; index += 1) {
    const ratio = index / arcSegments;
    points.push(
      toShapePoint(
        centerAngle - innerHalfAngle + innerHalfAngle * 2 * ratio,
        innerExtentX,
        innerExtentZ,
      ),
    );
  }
  for (let index = 0; index <= arcSegments; index += 1) {
    const ratio = index / arcSegments;
    points.push(
      toShapePoint(
        centerAngle + outerHalfAngle - outerHalfAngle * 2 * ratio,
        outerExtentX,
        outerExtentZ,
      ),
    );
  }

  const path = new Path();
  path.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((point) => path.lineTo(point.x, point.y));
  path.closePath();
  return path;
}

/**
 * Site slab with genuine holes beneath the non-walkable virage separations.
 * The openings expose the recessed ground below instead of a grey ramp-like
 * surface at the seating-tier level.
 */
export function createStadiumSiteBaseGeometry(
  radiusX: number,
  radiusZ: number,
  lowerTier: TierConfig,
) {
  const shape = new Shape();
  shape.absellipse(0, 0, radiusX, radiusZ, 0, Math.PI * 2, false, 0);
  lowerTier.majorCutouts.forEach((cutout) => {
    shape.holes.push(
      createCutoutPath(lowerTier, cutout.boundaryIndex, cutout.width),
    );
  });

  const geometry = new ShapeGeometry(shape, 192);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
