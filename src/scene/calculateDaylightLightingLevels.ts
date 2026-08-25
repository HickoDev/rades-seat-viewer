export type DaylightLightingLevels = {
  hemisphereIntensity: number;
  ambientIntensity: number;
  directionalIntensity: number;
};

export function calculateDaylightLightingLevels(
  daylightFactor: number,
  isNight: boolean,
): DaylightLightingLevels {
  if (isNight) {
    return {
      hemisphereIntensity: 0.12,
      ambientIntensity: 0.08,
      directionalIntensity: 0,
    };
  }

  const factor = Math.min(Math.max(daylightFactor, 0), 1);
  return {
    // Open-air stadium shade still receives substantial blue-sky and warm
    // concrete bounce. These fill values preserve colour without erasing the
    // clear roof-shadow boundary used by the exposure experience.
    hemisphereIntensity: 0.3 + factor * 0.62,
    ambientIntensity: 0.11,
    directionalIntensity: 0.55 + factor * 1.75,
  };
}
