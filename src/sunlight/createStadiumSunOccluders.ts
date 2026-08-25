import {
  BoxGeometry,
  BufferGeometry,
  CylinderGeometry,
  DoubleSide,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Quaternion,
  Vector3,
  type Object3D,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { createEllipticalRingGeometry } from '../stadium/bowl/createTierGeometry';
import { createGrandstandFacilityLayout } from '../stadium/bowl/grandstandLayout';
import { createStadiumPerimeterWallGeometry } from '../stadium/geometry/createStadiumPerimeterWallGeometry';
import {
  getStadiumPerimeterAngleForDistance,
  getStadiumPerimeterPoint,
} from '../stadium/geometry/stadiumPerimeter';
import { createRoofGeometry } from '../stadium/roof/createRoofGeometry';
import { createRoofTrussMatrices } from '../stadium/roof/createRoofTrussMatrices';
import { createCylinderBetweenMatrix } from '../utils/geometry';
import { enableBvhRaycasting } from '../utils/setupBvh';

enableBvhRaycasting();

function createOccluder(geometry: BufferGeometry, name: string) {
  geometry.computeBoundsTree();
  const mesh = new Mesh(
    geometry,
    new MeshBasicMaterial({ colorWrite: false, side: DoubleSide }),
  );
  mesh.name = name;
  mesh.updateMatrixWorld(true);
  return mesh;
}

function createBoxOccluder(
  name: string,
  size: [number, number, number],
  position: [number, number, number],
  rotationY = 0,
) {
  const mesh = createOccluder(new BoxGeometry(...size), name);
  mesh.position.set(...position);
  mesh.rotation.y = rotationY;
  mesh.updateMatrixWorld(true);
  return mesh;
}

function createMergedCylinderOccluder(name: string, matrices: Matrix4[]) {
  const source = new CylinderGeometry(1, 1, 1, 6);
  const parts = matrices.map((matrix) => source.clone().applyMatrix4(matrix));
  source.dispose();
  const merged = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  if (!merged) throw new Error(`Unable to merge ${name} sun occluders.`);
  return createOccluder(merged, name);
}

function getTierGaps(
  tier: (typeof radesStadiumConfig.tiers)[number],
  extentX: number,
  extentZ: number,
) {
  return tier.majorCutouts.map((cutout) => ({
    centerAngle: (cutout.boundaryIndex / tier.sectionCount) * Math.PI * 2,
    angularWidth: getStadiumPerimeterAngleForDistance(
      cutout.width,
      extentX,
      extentZ,
    ),
  }));
}

function createStructuralFrameMatrices() {
  const { roof, structure } = radesStadiumConfig;
  return Array.from({ length: structure.frameCount }, (_, frameIndex) => {
    const angle = (frameIndex / structure.frameCount) * Math.PI * 2;
    const base = getStadiumPerimeterPoint(
      angle,
      roof.outerRadiusX + structure.exteriorRadiusOffset,
      roof.outerRadiusZ + structure.exteriorRadiusOffset,
    );
    const top = getStadiumPerimeterPoint(
      angle,
      roof.outerRadiusX,
      roof.outerRadiusZ,
    );
    return createCylinderBetweenMatrix(
      new Vector3(base.x, structure.facadeHeight * 0.12, base.z),
      new Vector3(top.x, structure.portalFrameHeight, top.z),
      structure.columnRadius * 0.52,
    );
  });
}

function createColumnMatrices() {
  const { roof, structure } = radesStadiumConfig;
  return Array.from({ length: structure.frameCount }, (_, columnIndex) => {
    const angle = (columnIndex / structure.frameCount) * Math.PI * 2;
    return new Matrix4().compose(
      new Vector3(
        Math.cos(angle) * (roof.outerRadiusX + structure.exteriorRadiusOffset),
        structure.facadeHeight / 2,
        Math.sin(angle) * (roof.outerRadiusZ + structure.exteriorRadiusOffset),
      ),
      new Quaternion(),
      new Vector3(
        structure.columnRadius,
        structure.facadeHeight,
        structure.columnRadius,
      ),
    );
  });
}

function createMastMatrices() {
  const { roof } = radesStadiumConfig;
  return Array.from({ length: roof.mastCount }, (_, mastIndex) => {
    const angle = (mastIndex / roof.mastCount) * Math.PI * 2;
    const point = getStadiumPerimeterPoint(
      angle,
      roof.outerRadiusX + roof.mastBaseOffset,
      roof.outerRadiusZ + roof.mastBaseOffset,
    );
    return new Matrix4().compose(
      new Vector3(point.x, roof.mastHeight / 2, point.z),
      new Quaternion(),
      new Vector3(roof.mastBaseRadius, roof.mastHeight, roof.mastBaseRadius),
    );
  });
}

export function createStadiumSunOccluders(): Object3D[] {
  const { grandstand, roof, structure, tiers } = radesStadiumConfig;
  const occluders: Object3D[] = [];

  occluders.push(
    createOccluder(
      createRoofGeometry({
        innerRadiusX: roof.innerRadiusX,
        innerRadiusZ: roof.innerRadiusZ,
        outerRadiusX: roof.outerRadiusX,
        outerRadiusZ: roof.outerRadiusZ,
        innerHeight: roof.innerHeight,
        outerHeight: roof.outerHeight,
        thickness: roof.panelThickness,
        segments: 256,
        waveCount: roof.membraneBayCount,
        outerWaveHeight: roof.outerWaveHeight,
        outerWaveRadius: roof.outerWaveRadius,
        innerWaveHeight: roof.innerWaveHeight,
        membraneSag: roof.membraneSag,
      }),
      'sun-roof-membrane',
    ),
  );

  const upperTier = tiers.find((tier) => tier.id === 'upper');
  if (upperTier) {
    occluders.push(
      createOccluder(
        createEllipticalRingGeometry({
          innerRadiusX: upperTier.startRadiusX,
          innerRadiusZ: upperTier.startRadiusZ,
          outerRadiusX:
            upperTier.startRadiusX + upperTier.rowCount * upperTier.rowDepth,
          outerRadiusZ:
            upperTier.startRadiusZ + upperTier.rowCount * upperTier.rowDepth,
          height: upperTier.baseHeight,
          gaps: getTierGaps(
            upperTier,
            upperTier.startRadiusX,
            upperTier.startRadiusZ,
          ),
        }),
        'sun-upper-tier-slab',
      ),
    );
  }

  tiers.forEach((tier) => {
    const extentX =
      tier.startRadiusX + tier.rowCount * tier.rowDepth + tier.walkwayWidth;
    const extentZ =
      tier.startRadiusZ + tier.rowCount * tier.rowDepth + tier.walkwayWidth;
    occluders.push(
      createOccluder(
        createStadiumPerimeterWallGeometry({
          bottom: 0,
          extentX,
          extentZ,
          height: tier.baseHeight + tier.rowCount * tier.rowHeight,
          segments: 192,
          gaps: getTierGaps(tier, extentX, extentZ),
        }),
        `sun-${tier.id}-structural-wall`,
      ),
    );
  });

  occluders.push(
    createMergedCylinderOccluder(
      'sun-roof-trusses',
      createRoofTrussMatrices({
        frameCount: structure.frameCount,
        innerRadiusX: roof.innerRadiusX,
        innerRadiusZ: roof.innerRadiusZ,
        outerRadiusX: roof.outerRadiusX,
        outerRadiusZ: roof.outerRadiusZ,
        innerHeight: roof.innerHeight,
        outerHeight: roof.outerHeight,
        panelThickness: roof.panelThickness,
        innerTrussDepth: roof.innerTrussDepth,
        trussRadius: roof.trussRadius,
      }),
    ),
    createMergedCylinderOccluder(
      'sun-structural-frames',
      createStructuralFrameMatrices(),
    ),
    createMergedCylinderOccluder(
      'sun-exterior-columns',
      createColumnMatrices(),
    ),
    createMergedCylinderOccluder('sun-roof-masts', createMastMatrices()),
  );

  ([-1, 1] as const).forEach((side) => {
    occluders.push(
      createBoxOccluder(
        `sun-scoreboard-${side}`,
        [
          structure.scoreboardWidth + 0.7,
          structure.scoreboardHeight + 0.7,
          structure.scoreboardDepth,
        ],
        [
          side * (roof.innerRadiusX - structure.scoreboardDepth),
          roof.innerHeight -
            structure.scoreboardSupportDrop -
            structure.scoreboardHeight / 2,
          0,
        ],
        side === -1 ? Math.PI / 2 : -Math.PI / 2,
      ),
    );
  });

  if (upperTier) {
    const side = grandstand.side;
    const frontZ = side * (upperTier.startRadiusZ - grandstand.frontInset);
    occluders.push(
      createBoxOccluder(
        'sun-main-stand-facade',
        [grandstand.width, grandstand.height, grandstand.depth],
        [
          0,
          grandstand.baseHeight + grandstand.height / 2,
          frontZ + (side * grandstand.depth) / 2,
        ],
      ),
    );
    createGrandstandFacilityLayout(grandstand).forEach((facility) => {
      occluders.push(
        createBoxOccluder(
          `sun-${facility.id}`,
          [facility.width, facility.height, facility.depth],
          [
            facility.centerX,
            facility.baseHeight + facility.height / 2,
            frontZ + (side * facility.depth) / 2,
          ],
        ),
      );
    });
  }

  occluders.forEach((occluder) => occluder.updateMatrixWorld(true));
  return occluders;
}

export function disposeStadiumSunOccluders(occluders: Object3D[]) {
  occluders.forEach((occluder) => {
    if (occluder instanceof Mesh) {
      occluder.geometry.disposeBoundsTree();
      occluder.geometry.dispose();
      if (Array.isArray(occluder.material)) {
        occluder.material.forEach((material) => material.dispose());
      } else {
        occluder.material.dispose();
      }
    }
  });
}
