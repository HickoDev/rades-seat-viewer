import { useQuery } from '@tanstack/react-query';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { fetchMatchWeather } from './openMeteoClient';
import { isWithinForecastHorizon } from './weatherAssessment';

export function useMatchWeather(
  matchStartIso: string | null,
  matchEndIso: string | null,
  enabled: boolean,
) {
  const { identity } = radesStadiumConfig;
  const isForecastAvailable = Boolean(
    matchStartIso &&
    matchEndIso &&
    isWithinForecastHorizon(matchStartIso, identity.timezone),
  );

  const query = useQuery({
    queryKey: [
      'match-weather',
      identity.latitude,
      identity.longitude,
      matchStartIso,
      matchEndIso,
    ],
    queryFn: ({ signal }) =>
      fetchMatchWeather(
        {
          latitude: identity.latitude,
          longitude: identity.longitude,
          timezone: identity.timezone,
          matchStartIso: matchStartIso ?? '',
          matchEndIso: matchEndIso ?? '',
        },
        signal,
      ),
    enabled: enabled && isForecastAvailable,
    staleTime: 30 * 60 * 1000,
  });

  return { ...query, isForecastAvailable };
}
