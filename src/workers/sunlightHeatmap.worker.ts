/// <reference lib="webworker" />

import { DateTime } from 'luxon';
import type { Vector3 } from 'three';

import { calculateSeatView } from '../camera/calculateSeatView';
import { radesSeatLayout } from '../seats/seatMetadata';
import type { SeatMetadata } from '../seats/seat.types';
import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { getSectionId } from '../stadium/bowl/sectionIds';
import { calculateSeatShadow } from '../sunlight/calculateSeatShadow';
import {
  calculateSunPosition,
  toStadiumDateTime,
} from '../sunlight/calculateSunPosition';
import { createSunDirection } from '../sunlight/createSunDirection';
import {
  createStadiumSunOccluders,
  disposeStadiumSunOccluders,
} from '../sunlight/createStadiumSunOccluders';
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

function selectRepresentativeSeats(seats: SeatMetadata[]) {
  const indices = [0, Math.floor((seats.length - 1) / 2), seats.length - 1];
  return [...new Set(indices)]
    .map((index) => seats[index])
    .filter((seat): seat is SeatMetadata => seat !== undefined);
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
    seats: selectRepresentativeSeats(seats),
  }));
}

type DirectionSample = {
  direction: Vector3;
  minutes: number;
};

function createDirectionSamples(
  request: SunHeatmapWorkerRequest,
): DirectionSample[] {
  const { identity } = radesStadiumConfig;
  if (request.timeMode === 'instant') {
    const timestampIso = request.previewIso ?? request.matchStartIso;
    const sun = calculateSunPosition(
      timestampIso,
      identity.latitude,
      identity.longitude,
      identity.timezone,
    );
    return [
      {
        direction: createSunDirection(
          sun.altitudeRadians,
          sun.azimuthRadians,
          identity.northRotationDegrees,
        ),
        minutes: 1,
      },
    ];
  }

  let cursor = toStadiumDateTime(
    request.matchStartIso,
    identity.timezone,
  ).minus({
    minutes: 30,
  });
  const end = toStadiumDateTime(request.matchEndIso, identity.timezone);
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
  const occluders = createStadiumSunOccluders();
  try {
    const directionSamples = createDirectionSamples(request);
    const representatives = getRepresentativeSeats(request.resolution);
    const cells: SunHeatmapCell[] = representatives.map(({ key, seats }) => {
      let directSunMinutes = 0;
      let shadedMinutes = 0;

      seats.forEach((seat) => {
        const view = calculateSeatView(
          seat,
          radesStadiumConfig.seats.eyeHeight,
        );
        directionSamples.forEach((sample) => {
          const exposure = calculateSeatShadow(
            view.eyePosition,
            sample.direction,
            occluders,
          );
          if (exposure === 'direct-sun') directSunMinutes += sample.minutes;
          else shadedMinutes += sample.minutes;
        });
      });

      const sampleCount = Math.max(seats.length, 1);
      directSunMinutes /= sampleCount;
      shadedMinutes /= sampleCount;
      const totalMinutes = directSunMinutes + shadedMinutes;
      const representativeSeat = seats[Math.floor(seats.length / 2)];
      if (!representativeSeat) {
        throw new Error(`No representative seat for ${key}.`);
      }
      return {
        key,
        sectionId: representativeSeat.sectionId,
        tierId: representativeSeat.tierId,
        rowNumber:
          request.resolution === 'row' ? representativeSeat.rowNumber : null,
        representativeSeatId: representativeSeat.id,
        classification: classifyHeatmapExposure(
          directSunMinutes,
          shadedMinutes,
        ),
        directSunMinutes,
        shadedMinutes,
        exposedPercent:
          totalMinutes > 0 ? (directSunMinutes / totalMinutes) * 100 : 0,
      };
    });

    return {
      cacheKey: request.cacheKey,
      resolution: request.resolution,
      timeMode: request.timeMode,
      previewIso: request.previewIso,
      generatedAtIso: new Date().toISOString(),
      cells,
    };
  } finally {
    disposeStadiumSunOccluders(occluders);
  }
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
