import { describe, expect, it } from 'vitest';
import { BoxGeometry, Mesh, MeshBasicMaterial, Vector3 } from 'three';

import { calculateGlareRisk } from './calculateGlareRisk';
import { calculateSeatShadow } from './calculateSeatShadow';
import {
  calculateSunPosition,
  toStadiumDateTime,
} from './calculateSunPosition';
import { createSunDirection } from './createSunDirection';
import { simulateMatchExposure } from './simulateMatchExposure';

describe('sunlight calculations', () => {
  it('reports the sun below the horizon late at night in Tunis', () => {
    const sun = calculateSunPosition(
      '2026-06-21T23:00:00+01:00',
      36.7478,
      10.2728,
      'Africa/Tunis',
    );
    expect(sun.altitudeRadians).toBeLessThan(0);
  });

  it('converts local stadium time in the Africa/Tunis zone', () => {
    const dateTime = toStadiumDateTime('2026-08-24T16:00:00', 'Africa/Tunis');
    expect(dateTime.zoneName).toBe('Africa/Tunis');
    expect(dateTime.offset).toBe(60);
    expect(dateTime.hour).toBe(16);
  });

  it('rotates geographic north into world space explicitly', () => {
    const northAtZero = createSunDirection(0, 0, 0);
    const northRotatedEast = createSunDirection(0, 0, 90);
    expect(northAtZero.z).toBeCloseTo(1, 6);
    expect(northRotatedEast.x).toBeCloseTo(1, 6);
    expect(northRotatedEast.z).toBeCloseTo(0, 6);
  });

  it('returns stadium-shadow when a roof intersects the sun ray', () => {
    const roof = new Mesh(
      new BoxGeometry(10, 0.5, 10),
      new MeshBasicMaterial(),
    );
    roof.position.set(0, 5, 0);
    roof.updateMatrixWorld(true);
    expect(
      calculateSeatShadow(new Vector3(0, 1, 0), new Vector3(0, 1, 0), [roof]),
    ).toBe('stadium-shadow');
  });

  it('returns direct-sun for an unobstructed ray', () => {
    expect(
      calculateSeatShadow(new Vector3(0, 1, 0), new Vector3(0, 1, 0), []),
    ).toBe('direct-sun');
  });

  it('only reports glare for direct sunlight', () => {
    const viewing = new Vector3(0, 0, 1);
    const sun = new Vector3(0, 0.1, 1).normalize();
    expect(calculateGlareRisk(viewing, sun, 'direct-sun').risk).toBe('severe');
    expect(calculateGlareRisk(viewing, sun, 'stadium-shadow')).toEqual({
      angleDegrees: null,
      risk: 'none',
    });
  });

  it('keeps afternoon samples above the horizon before sunset', () => {
    const result = simulateMatchExposure({
      matchStartIso: '2026-08-24T16:00:00+01:00',
      matchEndIso: '2026-08-24T18:00:00+01:00',
      timezone: 'Africa/Tunis',
      latitude: 36.7478,
      longitude: 10.2728,
      northRotationDegrees: 0,
      eyePosition: new Vector3(82, 5.4, 8),
      viewingDirection: new Vector3(-1, -0.05, 0).normalize(),
      occluders: [],
    });

    expect(
      result.samples.every((sample) => sample.sunAltitudeRadians > 0),
    ).toBe(true);
    expect(
      result.samples.every(
        (sample) => sample.geometricExposure === 'direct-sun',
      ),
    ).toBe(true);
  });
});
