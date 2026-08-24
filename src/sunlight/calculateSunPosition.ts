import { DateTime } from 'luxon';
import * as SunCalc from 'suncalc';

import type { SunPositionResult } from './sunlight.types';

function hasExplicitOffset(iso: string) {
  return /(?:Z|[+-]\d{2}:?\d{2})$/i.test(iso);
}

export function toStadiumDateTime(iso: string, timezone: string): DateTime {
  const dateTime = hasExplicitOffset(iso)
    ? DateTime.fromISO(iso, { setZone: true }).setZone(timezone)
    : DateTime.fromISO(iso, { zone: timezone });

  if (!dateTime.isValid) {
    throw new Error(`Invalid stadium date/time: ${iso}`);
  }

  return dateTime;
}

function dateToIso(date: Date | null, timezone: string): string | null {
  if (!date || Number.isNaN(date.getTime())) return null;
  return DateTime.fromJSDate(date).setZone(timezone).toISO();
}

export function calculateSunPosition(
  timestampIso: string,
  latitude: number,
  longitude: number,
  timezone: string,
): SunPositionResult {
  const dateTime = toStadiumDateTime(timestampIso, timezone);
  const date = dateTime.toJSDate();
  const position = SunCalc.getPosition(date, latitude, longitude);
  const times = SunCalc.getTimes(date, latitude, longitude);
  // SunCalc 2 exposes apparent altitude and north-clockwise azimuth in degrees.
  // The rest of the simulation deliberately uses radians at its boundaries.
  const altitudeRadians = (position.altitude * Math.PI) / 180;
  const northClockwiseAzimuth =
    (((position.azimuth % 360) + 360) % 360) * (Math.PI / 180);

  return {
    timestampIso: dateTime.toISO() ?? timestampIso,
    altitudeRadians,
    azimuthRadians: northClockwiseAzimuth,
    sunriseIso: dateToIso(times.sunrise, timezone),
    sunsetIso: dateToIso(times.sunset, timezone),
  };
}
