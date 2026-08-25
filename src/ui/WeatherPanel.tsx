import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { useStadiumStore } from '../state/useStadiumStore';
import { useMatchWeather } from '../weather/useMatchWeather';
import {
  classifyExpectedIntensity,
  classifyThermalComfort,
  describeWeatherCode,
  findWeatherAtTime,
} from '../weather/weatherAssessment';

function formatValue(value: number | null, unit: string, digits = 0) {
  return value === null ? 'Unavailable' : `${value.toFixed(digits)}${unit}`;
}

export function WeatherPanel() {
  const matchStartIso = useStadiumStore((state) => state.matchStartIso);
  const matchEndIso = useStadiumStore((state) => state.matchEndIso);
  const sunExposure = useStadiumStore((state) => state.sunExposureResult);
  const weather = useMatchWeather(
    matchStartIso,
    matchEndIso,
    Boolean(matchStartIso && matchEndIso),
  );

  if (!matchStartIso || !matchEndIso) return null;

  const kickoffWeather = weather.data
    ? findWeatherAtTime(
        weather.data.hours,
        matchStartIso,
        radesStadiumConfig.identity.timezone,
      )
    : null;
  const kickoffExposure = sunExposure?.samples.find(
    (sample) => sample.timestampIso >= matchStartIso,
  )?.geometricExposure;
  const intensity = kickoffWeather
    ? kickoffExposure === 'stadium-shadow' ||
      kickoffExposure === 'sun-below-horizon'
      ? 'none'
      : classifyExpectedIntensity(
          kickoffWeather.directNormalIrradianceWattsPerSquareMetre,
          kickoffWeather.directRadiationWattsPerSquareMetre,
        )
    : null;
  const comfort = classifyThermalComfort(
    kickoffWeather?.apparentTemperatureCelsius ?? null,
  );

  return (
    <div className="weather-panel" aria-live="polite">
      <div className="condition-card__title">
        <div>
          <span className="condition-icon" aria-hidden="true">
            ◌
          </span>
          <div>
            <strong>Kickoff weather</strong>
            <small>Automatic forecast</small>
          </div>
        </div>
        <span className="automatic-badge">Live</span>
      </div>

      {!weather.isForecastAvailable && (
        <p className="forecast-unavailable">
          <strong>Forecast not available yet</strong>
          Astronomical sun and stadium shade remain available. Live weather
          appears inside the 15-day forecast window.
        </p>
      )}
      {weather.isLoading && (
        <p className="simulation-message">Loading expected conditions…</p>
      )}
      {weather.isError && (
        <p className="forecast-unavailable">
          <strong>Weather temporarily unavailable</strong>
          Sun and stadium-shadow results are unaffected.
        </p>
      )}
      {weather.isSuccess && !kickoffWeather && (
        <p className="forecast-unavailable">
          No hourly forecast matched the selected kickoff.
        </p>
      )}
      {kickoffWeather && (
        <article className="weather-card">
          <div className={`weather-comfort weather-comfort--${comfort.level}`}>
            <span>How it may feel</span>
            <strong>{comfort.label}</strong>
            <p>{comfort.description}</p>
          </div>

          <div className="weather-card__lead">
            <div>
              <span>Air temperature</span>
              <strong>
                {formatValue(kickoffWeather.temperatureCelsius, '°C')}
              </strong>
            </div>
            <div>
              <span>Feels like</span>
              <strong>
                {formatValue(kickoffWeather.apparentTemperatureCelsius, '°C')}
              </strong>
            </div>
            <small>{describeWeatherCode(kickoffWeather.weatherCode)}</small>
          </div>

          <dl>
            <div>
              <dt>At your place</dt>
              <dd>
                {kickoffExposure
                  ? kickoffExposure.replaceAll('-', ' ')
                  : 'Select a place'}
              </dd>
            </div>
            <div>
              <dt>Sun strength</dt>
              <dd>{intensity ?? 'Calculating'}</dd>
            </div>
            <div>
              <dt>Rain chance</dt>
              <dd>
                {formatValue(
                  kickoffWeather.precipitationProbabilityPercent,
                  '%',
                )}
              </dd>
            </div>
            <div>
              <dt>Cloud cover</dt>
              <dd>{formatValue(kickoffWeather.cloudCoverPercent, '%')}</dd>
            </div>
            <div>
              <dt>Wind</dt>
              <dd>
                {formatValue(
                  kickoffWeather.windSpeedKilometresPerHour,
                  ' km/h',
                )}
              </dd>
            </div>
            <div>
              <dt>Direct radiation</dt>
              <dd>
                {formatValue(
                  kickoffWeather.directRadiationWattsPerSquareMetre,
                  ' W/m²',
                )}
              </dd>
            </div>
          </dl>
          <p>
            “Feels like” includes atmospheric conditions. Seat shade comes from
            the stadium geometry and is calculated separately.
          </p>
        </article>
      )}
    </div>
  );
}
