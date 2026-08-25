import { DateTime } from 'luxon';

import type {
  ExpectedIntensity,
  ThermalComfort,
  WeatherHour,
} from './weather.types';

export function classifyThermalComfort(
  apparentTemperatureCelsius: number | null,
): ThermalComfort {
  if (apparentTemperatureCelsius === null) {
    return {
      level: 'unavailable',
      label: 'Not available',
      description: 'No feels-like temperature is available for kickoff.',
    };
  }
  if (apparentTemperatureCelsius >= 40) {
    return {
      level: 'extreme-heat',
      label: 'Extreme heat',
      description:
        'Strong heat discomfort is likely, especially in direct sun.',
    };
  }
  if (apparentTemperatureCelsius >= 35) {
    return {
      level: 'very-hot',
      label: 'Very hot',
      description: 'Shade will make a meaningful difference during the match.',
    };
  }
  if (apparentTemperatureCelsius >= 30) {
    return {
      level: 'hot',
      label: 'Hot',
      description: 'Direct sun may feel uncomfortable over a full match.',
    };
  }
  if (apparentTemperatureCelsius >= 24) {
    return {
      level: 'warm',
      label: 'Warm',
      description:
        'Conditions should feel warm, with extra heat in direct sun.',
    };
  }
  if (apparentTemperatureCelsius >= 16) {
    return {
      level: 'comfortable',
      label: 'Comfortable',
      description:
        'The expected feels-like temperature is generally comfortable.',
    };
  }
  return {
    level: 'cool',
    label: 'Cool',
    description: 'Conditions may feel cool while seated or in stadium shade.',
  };
}

export function isWithinForecastHorizon(
  matchStartIso: string,
  timezone: string,
  now: DateTime = DateTime.now(),
) {
  const eventDay = DateTime.fromISO(matchStartIso, { setZone: true })
    .setZone(timezone)
    .startOf('day');
  const today = now.setZone(timezone).startOf('day');
  if (!eventDay.isValid || !today.isValid) return false;
  const dayDifference = Math.round(eventDay.diff(today, 'days').days);
  return dayDifference >= 0 && dayDifference <= 15;
}

export function findWeatherAtTime(
  hours: WeatherHour[],
  timestampIso: string,
  timezone: string,
): WeatherHour | null {
  const target = DateTime.fromISO(timestampIso, { setZone: true }).setZone(
    timezone,
  );
  let closest: WeatherHour | null = null;
  let closestMinutes = Infinity;

  for (const hour of hours) {
    const candidate = DateTime.fromISO(hour.timestampLocal, { zone: timezone });
    const difference = Math.abs(candidate.diff(target, 'minutes').minutes);
    if (difference < closestMinutes) {
      closest = hour;
      closestMinutes = difference;
    }
  }

  return closestMinutes <= 90 ? closest : null;
}

export function classifyExpectedIntensity(
  directNormalIrradiance: number | null,
  directRadiation: number | null,
): ExpectedIntensity {
  const radiation = directNormalIrradiance ?? directRadiation;
  if (radiation === null || radiation <= 0) return 'none';
  if (radiation >= 600) return 'strong';
  if (radiation >= 250) return 'moderate';
  return 'weak';
}

export function describeWeatherCode(code: number | null) {
  if (code === null) return 'Unknown conditions';
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code === 45 || code === 48) return 'Fog';
  if (code >= 51 && code <= 67) return 'Rain or drizzle';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 85 && code <= 86) return 'Snow showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Variable conditions';
}
