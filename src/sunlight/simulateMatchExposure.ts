import { DateTime } from 'luxon';
import type { Object3D, Vector3 } from 'three';

import { calculateGlareRisk } from './calculateGlareRisk';
import { calculateSeatShadow } from './calculateSeatShadow';
import {
  calculateSunPosition,
  toStadiumDateTime,
} from './calculateSunPosition';
import { createSunDirection } from './createSunDirection';
import type {
  GlareRisk,
  SunExposureSample,
  SunExposureSimulation,
} from './sunlight.types';

export type MatchExposureOptions = {
  matchStartIso: string;
  matchEndIso: string;
  timezone: string;
  latitude: number;
  longitude: number;
  northRotationDegrees: number;
  eyePosition: Vector3;
  viewingDirection: Vector3;
  occluders: Object3D[];
  sampleIntervalMinutes?: number;
  preKickoffMinutes?: number;
};

const glareRank: Record<GlareRisk, number> = {
  none: 0,
  low: 1,
  moderate: 2,
  high: 3,
  severe: 4,
};

export function simulateMatchExposure({
  eyePosition,
  latitude,
  longitude,
  matchEndIso,
  matchStartIso,
  northRotationDegrees,
  occluders,
  preKickoffMinutes = 30,
  sampleIntervalMinutes = 5,
  timezone,
  viewingDirection,
}: MatchExposureOptions): SunExposureSimulation {
  let cursor = toStadiumDateTime(matchStartIso, timezone).minus({
    minutes: preKickoffMinutes,
  });
  const end = toStadiumDateTime(matchEndIso, timezone);
  const samples: SunExposureSample[] = [];
  let sunsetIso: string | null = null;

  while (cursor <= end) {
    const timestampIso = cursor.toISO();
    if (!timestampIso) break;
    const sun = calculateSunPosition(
      timestampIso,
      latitude,
      longitude,
      timezone,
    );
    sunsetIso ??= sun.sunsetIso;
    const direction = createSunDirection(
      sun.altitudeRadians,
      sun.azimuthRadians,
      northRotationDegrees,
    );
    const geometricExposure = calculateSeatShadow(
      eyePosition,
      direction,
      occluders,
    );
    const glare = calculateGlareRisk(
      viewingDirection,
      direction,
      geometricExposure,
    );
    samples.push({
      timestampIso,
      sunAltitudeRadians: sun.altitudeRadians,
      sunAzimuthRadians: sun.azimuthRadians,
      geometricExposure,
      glareAngleDegrees: glare.angleDegrees,
      glareRisk: glare.risk,
    });
    cursor = cursor.plus({ minutes: sampleIntervalMinutes });
  }

  let directSunMinutes = 0;
  let shadedMinutes = 0;
  let firstEntersShadeIso: string | null = null;
  let reentersSunlightIso: string | null = null;
  let peakGlareRisk: GlareRisk = 'none';

  samples.forEach((sample, index) => {
    const next = samples[index + 1];
    const intervalMinutes = next
      ? Math.max(
          0,
          DateTime.fromISO(next.timestampIso).diff(
            DateTime.fromISO(sample.timestampIso),
            'minutes',
          ).minutes,
        )
      : 0;
    if (sample.geometricExposure === 'direct-sun') {
      directSunMinutes += intervalMinutes;
    } else {
      shadedMinutes += intervalMinutes;
    }
    const previous = samples[index - 1];
    if (
      !firstEntersShadeIso &&
      previous?.geometricExposure === 'direct-sun' &&
      sample.geometricExposure === 'stadium-shadow'
    ) {
      firstEntersShadeIso = sample.timestampIso;
    }
    if (
      !reentersSunlightIso &&
      previous?.geometricExposure === 'stadium-shadow' &&
      sample.geometricExposure === 'direct-sun'
    ) {
      reentersSunlightIso = sample.timestampIso;
    }
    if (glareRank[sample.glareRisk] > glareRank[peakGlareRisk]) {
      peakGlareRisk = sample.glareRisk;
    }
  });

  const totalMinutes = directSunMinutes + shadedMinutes;
  return {
    samples,
    summary: {
      directSunMinutes,
      shadedMinutes,
      firstEntersShadeIso,
      reentersSunlightIso,
      sunsetIso,
      exposedPercent:
        totalMinutes === 0 ? 0 : (directSunMinutes / totalMinutes) * 100,
      peakGlareRisk,
    },
  };
}
