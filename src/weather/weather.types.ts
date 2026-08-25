import type { GeometricExposure, GlareRisk } from '../sunlight/sunlight.types';

export type ExpectedIntensity = 'strong' | 'moderate' | 'weak' | 'none';
export type ThermalComfortLevel =
  | 'extreme-heat'
  | 'very-hot'
  | 'hot'
  | 'warm'
  | 'comfortable'
  | 'cool'
  | 'unavailable';

export type ThermalComfort = {
  level: ThermalComfortLevel;
  label: string;
  description: string;
};

export type WeatherHour = {
  timestampLocal: string;
  temperatureCelsius: number | null;
  apparentTemperatureCelsius: number | null;
  cloudCoverPercent: number | null;
  cloudCoverLowPercent: number | null;
  cloudCoverMidPercent: number | null;
  cloudCoverHighPercent: number | null;
  directRadiationWattsPerSquareMetre: number | null;
  directNormalIrradianceWattsPerSquareMetre: number | null;
  shortwaveRadiationWattsPerSquareMetre: number | null;
  precipitationProbabilityPercent: number | null;
  windSpeedKilometresPerHour: number | null;
  weatherCode: number | null;
};

export type MatchWeatherForecast = {
  timezone: string;
  fetchedAtIso: string;
  hours: WeatherHour[];
};

export type SeatSunAssessment = {
  geometricExposure: GeometricExposure;
  expectedIntensity: ExpectedIntensity;
  glareRisk: GlareRisk;
  exposedMinutes: number;
  shadedMinutes: number;
  cloudCoverPercent: number | null;
  directRadiationWattsPerSquareMetre: number | null;
};
