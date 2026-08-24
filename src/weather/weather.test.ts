import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import { buildOpenMeteoUrl, requestedHourlyFields } from './openMeteoClient';
import {
  classifyExpectedIntensity,
  isWithinForecastHorizon,
} from './weatherAssessment';
import { openMeteoResponseSchema } from './weatherSchema';

describe('weather integration', () => {
  it('requests only the useful hourly forecast fields', () => {
    const url = buildOpenMeteoUrl({
      latitude: 36.7478,
      longitude: 10.2728,
      timezone: 'Africa/Tunis',
      matchStartIso: '2026-08-24T16:00:00+01:00',
      matchEndIso: '2026-08-24T18:00:00+01:00',
    });
    expect(url.searchParams.get('hourly')?.split(',')).toEqual([
      ...requestedHourlyFields,
    ]);
    expect(url.searchParams.get('timezone')).toBe('Africa/Tunis');
  });

  it('rejects malformed hourly responses', () => {
    expect(() => openMeteoResponseSchema.parse({ hourly: {} })).toThrow();
  });

  it('does not present a long-range event as forecastable', () => {
    const now = DateTime.fromISO('2026-08-24T12:00:00+01:00');
    expect(
      isWithinForecastHorizon('2026-09-20T16:00:00+01:00', 'Africa/Tunis', now),
    ).toBe(false);
    expect(
      isWithinForecastHorizon('2026-08-30T16:00:00+01:00', 'Africa/Tunis', now),
    ).toBe(true);
  });

  it('uses direct irradiance rather than cloud cover for intensity', () => {
    expect(classifyExpectedIntensity(720, 500)).toBe('strong');
    expect(classifyExpectedIntensity(310, 250)).toBe('moderate');
    expect(classifyExpectedIntensity(80, 40)).toBe('weak');
    expect(classifyExpectedIntensity(0, 0)).toBe('none');
  });
});
