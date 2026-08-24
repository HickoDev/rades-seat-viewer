import { DateTime } from 'luxon';

import { openMeteoResponseSchema } from './weatherSchema';
import type { MatchWeatherForecast, WeatherHour } from './weather.types';

const forecastEndpoint = 'https://api.open-meteo.com/v1/forecast';

export const requestedHourlyFields = [
  'temperature_2m',
  'apparent_temperature',
  'cloud_cover',
  'cloud_cover_low',
  'cloud_cover_mid',
  'cloud_cover_high',
  'direct_radiation',
  'direct_normal_irradiance',
  'shortwave_radiation',
  'precipitation_probability',
  'wind_speed_10m',
  'weather_code',
] as const;

export type MatchWeatherRequest = {
  latitude: number;
  longitude: number;
  timezone: string;
  matchStartIso: string;
  matchEndIso: string;
};

function localDate(iso: string, timezone: string) {
  const value = DateTime.fromISO(iso, { setZone: true }).setZone(timezone);
  if (!value.isValid) throw new Error(`Invalid match date/time: ${iso}`);
  return value.toISODate();
}

function valueAt(values: Array<number | null>, index: number) {
  return values[index] ?? null;
}

export function buildOpenMeteoUrl({
  latitude,
  longitude,
  matchEndIso,
  matchStartIso,
  timezone,
}: MatchWeatherRequest) {
  const url = new URL(forecastEndpoint);
  url.searchParams.set('latitude', latitude.toString());
  url.searchParams.set('longitude', longitude.toString());
  url.searchParams.set('timezone', timezone);
  url.searchParams.set('start_date', localDate(matchStartIso, timezone) ?? '');
  url.searchParams.set('end_date', localDate(matchEndIso, timezone) ?? '');
  url.searchParams.set('hourly', requestedHourlyFields.join(','));
  return url;
}

export async function fetchMatchWeather(
  request: MatchWeatherRequest,
  signal?: AbortSignal,
): Promise<MatchWeatherForecast> {
  const response = await fetch(buildOpenMeteoUrl(request), { signal });
  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with ${response.status}`);
  }

  const parsed = openMeteoResponseSchema.parse(await response.json());
  const hours: WeatherHour[] = parsed.hourly.time.map(
    (timestampLocal, index) => ({
      timestampLocal,
      temperatureCelsius: valueAt(parsed.hourly.temperature_2m, index),
      apparentTemperatureCelsius: valueAt(
        parsed.hourly.apparent_temperature,
        index,
      ),
      cloudCoverPercent: valueAt(parsed.hourly.cloud_cover, index),
      cloudCoverLowPercent: valueAt(parsed.hourly.cloud_cover_low, index),
      cloudCoverMidPercent: valueAt(parsed.hourly.cloud_cover_mid, index),
      cloudCoverHighPercent: valueAt(parsed.hourly.cloud_cover_high, index),
      directRadiationWattsPerSquareMetre: valueAt(
        parsed.hourly.direct_radiation,
        index,
      ),
      directNormalIrradianceWattsPerSquareMetre: valueAt(
        parsed.hourly.direct_normal_irradiance,
        index,
      ),
      shortwaveRadiationWattsPerSquareMetre: valueAt(
        parsed.hourly.shortwave_radiation,
        index,
      ),
      precipitationProbabilityPercent: valueAt(
        parsed.hourly.precipitation_probability,
        index,
      ),
      windSpeedKilometresPerHour: valueAt(parsed.hourly.wind_speed_10m, index),
      weatherCode: valueAt(parsed.hourly.weather_code, index),
    }),
  );

  return {
    timezone: parsed.timezone,
    fetchedAtIso: new Date().toISOString(),
    hours,
  };
}
