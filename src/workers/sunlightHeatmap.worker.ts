/// <reference lib="webworker" />

import { DateTime } from 'luxon';
import {
  BoxGeometry,
  CylinderGeometry,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  type BufferGeometry,
  type Object3D,
  type Vector3,
} from 'three';

import { calculateSeatView } from '../camera/calculateSeatView';
import { radesSeatLayout } from '../seats/seatMetadata';
import type { SeatMetadata } from '../seats/seat.types';
import { createEllipticalRingGeometry } from '../stadium/bowl/createTierGeometry';
import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { getSectionId } from '../stadium/bowl/sectionIds';
import { createRoofGeometry } from '../stadium/roof/createRoofGeometry';
import { enableBvhRaycasting } from '../utils/setupBvh';
import { calculateSeatShadow } from '../sunlight/calculateSeatShadow';
import {
  calculateSunPosition,
  toStadiumDateTime,
} from '../sunlight/calculateSunPosition';
import { createSunDirection } from '../sunlight/createSunDirection';
import {
  classifyHeatmapExposure,
  getHeatmapGroupKey,
} from '../sunlight/sunlightHeatmap';
import type {
  HeatmapResolution,
  SunHeatmapCell,
  SunHeatmapWorkerRequest,
  SunHeatmapWorkerResponse,
} from '../sunlight/sunlightHeatmap.types';

enableBvhRaycasting();

const occluderMaterial = new MeshBasicMaterial({ side: DoubleSide });

function createOccluder(geometry: BufferGeometry) {
  geometry.computeBoundsTree();
  return new Mesh(geometry, occluderMaterial);
}

function createStaticOccluders(): Object3D[] {
  const { roof, structure, tiers } = radesStadiumConfig;
  const roofMesh = createOccluder(
    createRoofGeometry({
      innerRadiusX: roof.innerRadiusX,
      innerRadiusZ: roof.innerRadiusZ,
      outerRadiusX: roof.outerRadiusX,
      outerRadiusZ: roof.outerRadiusZ,
      innerHeight: roof.innerHeight,
      outerHeight: roof.outerHeight,
      thickness: roof.panelThickness,
      segments: 192,
    }),
  );
  roofMesh.name = 'heatmap-roof-occluder';

  const occluders: Object3D[] = [roofMesh];
  const upperTier = tiers.find((tier) => tier.id === 'upper');
  if (upperTier) {
    const upperSlab = createOccluder(
      createEllipticalRingGeometry({
        innerRadiusX: upperTier.startRadiusX,
        innerRadiusZ: upperTier.startRadiusZ,
        outerRadiusX:
          upperTier.startRadiusX + upperTier.rowCount * upperTier.rowDepth,
        outerRadiusZ:
          upperTier.startRadiusZ + upperTier.rowCount * upperTier.rowDepth,
        height: upperTier.baseHeight,
      }),
    );
    upperSlab.name = 'heatmap-upper-tier-slab';
    occluders.push(upperSlab);
  }

  tiers.forEach((tier) => {
    const outerRadiusX =
      tier.startRadiusX + tier.rowCount * tier.rowDepth + tier.walkwayWidth;
    const outerRadiusZ =
      tier.startRadiusZ + tier.rowCount * tier.rowDepth + tier.walkwayWidth;
    const height = tier.baseHeight + tier.rowCount * tier.rowHeight;
    const wall = createOccluder(new CylinderGeometry(1, 1, 1, 128, 1, true));
    wall.position.y = height / 2;
    wall.scale.set(outerRadiusX, height, outerRadiusZ);
    wall.name = `heatmap-${tier.id}-outer-wall`;
    wall.updateMatrixWorld(true);
    occluders.push(wall);
  });

  ([-1, 1] as const).forEach((side) => {
    const scoreboard = createOccluder(
      new BoxGeometry(
        structure.scoreboardWidth,
        structure.scoreboardHeight,
        structure.scoreboardDepth,
      ),
    );
    scoreboard.position.set(
      side * (roof.innerRadiusX - structure.scoreboardDepth),
      roof.innerHeight - structure.scoreboardHeight,
      0,
    );
    scoreboard.rotation.y = side === -1 ? Math.PI / 2 : -Math.PI / 2;
    scoreboard.name = `heatmap-scoreboard-${side}`;
    scoreboard.updateMatrixWorld(true);
    occluders.push(scoreboard);
  });

  occluders.forEach((occluder) => occluder.updateMatrixWorld(true));
  return occluders;
}

function getRepresentativeSeats(resolution: HeatmapResolution) {
  const groups = new Map<string, SeatMetadata[]>();
  const closedSectionIds = new Set(
    radesStadiumConfig.tiers.flatMap((tier) =>
      tier.closedToVisitorsSectionIndices.map((sectionIndex) =>
        getSectionId(tier.id, sectionIndex),
      ),
    ),
  );
  radesSeatLayout.metadata.forEach((seat) => {
    if (closedSectionIds.has(seat.sectionId)) return;
    const key = getHeatmapGroupKey(seat.sectionId, seat.rowNumber, resolution);
    const group = groups.get(key);
    if (group) group.push(seat);
    else groups.set(key, [seat]);
  });

  return [...groups.entries()].map(([key, seats]) => ({
    key,
    seat: seats[Math.floor(seats.length / 2)],
  }));
}

type DirectionSample = {
  direction: Vector3;
  minutes: number;
};

function createDirectionSamples(
  matchStartIso: string,
  matchEndIso: string,
): DirectionSample[] {
  const { identity } = radesStadiumConfig;
  let cursor = toStadiumDateTime(matchStartIso, identity.timezone).minus({
    minutes: 30,
  });
  const end = toStadiumDateTime(matchEndIso, identity.timezone);
  const samples: DirectionSample[] = [];

  while (cursor < end) {
    const next = DateTime.min(cursor.plus({ minutes: 5 }), end);
    const timestampIso = cursor.toISO();
    if (!timestampIso) break;
    const sun = calculateSunPosition(
      timestampIso,
      identity.latitude,
      identity.longitude,
      identity.timezone,
    );
    samples.push({
      direction: createSunDirection(
        sun.altitudeRadians,
        sun.azimuthRadians,
        identity.northRotationDegrees,
      ),
      minutes: next.diff(cursor, 'minutes').minutes,
    });
    cursor = next;
  }

  return samples;
}

function runSimulation(request: SunHeatmapWorkerRequest) {
  const occluders = createStaticOccluders();
  const directionSamples = createDirectionSamples(
    request.matchStartIso,
    request.matchEndIso,
  );
  const representatives = getRepresentativeSeats(request.resolution);
  const cells: SunHeatmapCell[] = representatives.map(({ key, seat }) => {
    const view = calculateSeatView(seat, radesStadiumConfig.seats.eyeHeight);
    let directSunMinutes = 0;
    let shadedMinutes = 0;

    directionSamples.forEach((sample) => {
      const exposure = calculateSeatShadow(
        view.eyePosition,
        sample.direction,
        occluders,
      );
      if (exposure === 'direct-sun') directSunMinutes += sample.minutes;
      else shadedMinutes += sample.minutes;
    });

    const totalMinutes = directSunMinutes + shadedMinutes;
    return {
      key,
      sectionId: seat.sectionId,
      tierId: seat.tierId,
      rowNumber: request.resolution === 'row' ? seat.rowNumber : null,
      representativeSeatId: seat.id,
      classification: classifyHeatmapExposure(directSunMinutes, shadedMinutes),
      directSunMinutes,
      shadedMinutes,
      exposedPercent:
        totalMinutes > 0 ? (directSunMinutes / totalMinutes) * 100 : 0,
    };
  });

  return {
    cacheKey: request.cacheKey,
    resolution: request.resolution,
    generatedAtIso: new Date().toISOString(),
    cells,
  };
}

self.onmessage = (event: MessageEvent<SunHeatmapWorkerRequest>) => {
  if (event.data.type !== 'simulate') return;
  try {
    const response: SunHeatmapWorkerResponse = {
      type: 'result',
      result: runSimulation(event.data),
    };
    self.postMessage(response);
  } catch (error) {
    const response: SunHeatmapWorkerResponse = {
      type: 'error',
      cacheKey: event.data.cacheKey,
      message: error instanceof Error ? error.message : 'Heatmap failed',
    };
    self.postMessage(response);
  }
};

export {};
