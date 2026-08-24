export type GeometricExposure =
  'direct-sun' | 'stadium-shadow' | 'sun-below-horizon';

export type GlareRisk = 'severe' | 'high' | 'moderate' | 'low' | 'none';

export type SunPositionResult = {
  timestampIso: string;
  altitudeRadians: number;
  azimuthRadians: number;
  sunriseIso: string | null;
  sunsetIso: string | null;
};

export type SunExposureSample = {
  timestampIso: string;
  sunAltitudeRadians: number;
  sunAzimuthRadians: number;
  geometricExposure: GeometricExposure;
  glareAngleDegrees: number | null;
  glareRisk: GlareRisk;
};

export type SunExposureSummary = {
  directSunMinutes: number;
  shadedMinutes: number;
  firstEntersShadeIso: string | null;
  reentersSunlightIso: string | null;
  sunsetIso: string | null;
  exposedPercent: number;
  peakGlareRisk: GlareRisk;
};

export type SunExposureSimulation = {
  samples: SunExposureSample[];
  summary: SunExposureSummary;
};
