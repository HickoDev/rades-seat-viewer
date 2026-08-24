import { MathUtils, Vector3 } from 'three';

import type { GeometricExposure, GlareRisk } from './sunlight.types';

export type GlareAssessment = {
  angleDegrees: number | null;
  risk: GlareRisk;
};

export function calculateGlareRisk(
  viewingDirection: Vector3,
  directionTowardSun: Vector3,
  exposure: GeometricExposure,
): GlareAssessment {
  if (exposure !== 'direct-sun') {
    return { angleDegrees: null, risk: 'none' };
  }

  const angleDegrees = MathUtils.radToDeg(
    viewingDirection.angleTo(directionTowardSun),
  );
  const risk: GlareRisk =
    angleDegrees <= 15
      ? 'severe'
      : angleDegrees <= 30
        ? 'high'
        : angleDegrees <= 60
          ? 'moderate'
          : 'low';

  return { angleDegrees, risk };
}
