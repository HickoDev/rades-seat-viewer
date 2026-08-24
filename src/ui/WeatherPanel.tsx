import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { useStadiumStore } from '../state/useStadiumStore';
import { useMatchWeather } from '../weather/useMatchWeather';
import {
  classifyExpectedIntensity,
  describeWeatherCode,
  findWeatherAtTime,
} from '../weather/weatherAssessment';

function formatValue(value: number | null, unit: string, digits = 0) {
  return value === null ? 'Unavailable' : `${value.toFixed(digits)}${unit}`;
}

export function WeatherPanel() {
  const matchStartIso = useStadiumStore((state) => state.matchStartIso);
  const matchEndIso = useStadiumStore((state) => state.matchEndIso);
  const showWeather = useStadiumStore((state) => state.showWeather);
  const toggleWeather = useStadiumStore((state) => state.toggleWeather);
  const sunExposure = useStadiumStore((state) => state.sunExposureResult);
  const weather = useMatchWeather(matchStartIso, matchEndIso, showWeather);

  const kickoffWeather =
    weather.data && matchStartIso
      ? findWeatherAtTime(
          weather.data.hours,
          matchStartIso,
          radesStadiumConfig.identity.timezone,
        )
      : null;
  const kickoffExposure = matchStartIso
    ? sunExposure?.samples.find(
        (sample) => sample.timestampIso >= matchStartIso,
      )?.geometricExposure
    : undefined;
  const intensity = kickoffWeather
    ? kickoffExposure === 'direct-sun'
      ? classifyExpectedIntensity(
          kickoffWeather.directNormalIrradianceWattsPerSquareMetre,
          kickoffWeather.directRadiationWattsPerSquareMetre,
        )
      : kickoffExposure
        ? 'none'
        : null
    : null;

  return (
    <div className="weather-panel">
      <button
        className={`simulation-toggle ${showWeather ? 'simulation-toggle--active' : ''}`}
        type="button"
        aria-pressed={showWeather}
        onClick={toggleWeather}
      >
        <span aria-hidden="true">☁</span>
        {showWeather ? 'Weather forecast on' : 'Enable weather forecast'}
      </button>

      {showWeather && !matchStartIso && (
        <p className="simulation-message">Choose a match date and time.</p>
      )}
      {showWeather && matchStartIso && !weather.isForecastAvailable && (
        <p className="forecast-unavailable">
          Astronomical sun simulation available.
          <br />
          Weather forecast not yet available.
        </p>
      )}
      {showWeather && weather.isLoading && (
        <p className="simulation-message">Loading expected conditions…</p>
      )}
      {showWeather && weather.isError && (
        <p className="forecast-unavailable">
          The live forecast is temporarily unavailable. Astronomical and
          geometric sunlight results are unaffected.
        </p>
      )}
      {showWeather && weather.isSuccess && !kickoffWeather && (
        <p className="forecast-unavailable">
          No hourly forecast matched the selected kickoff.
        </p>
      )}
      {showWeather && kickoffWeather && (
        <div className="weather-card" aria-live="polite">
          <div className="weather-card__lead">
            <span>Kickoff forecast</span>
            <strong>
              {formatValue(kickoffWeather.temperatureCelsius, '°C')}
            </strong>
            <small>{describeWeatherCode(kickoffWeather.weatherCode)}</small>
          </div>
          <dl>
            <div>
              <dt>Feels like</dt>
              <dd>
                {formatValue(kickoffWeather.apparentTemperatureCelsius, '°C')}
              </dd>
            </div>
            <div>
              <dt>Cloud cover</dt>
              <dd>{formatValue(kickoffWeather.cloudCoverPercent, '%')}</dd>
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
            <div>
              <dt>Expected intensity</dt>
              <dd>{intensity ?? 'Run sun simulation'}</dd>
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
              <dt>Wind</dt>
              <dd>
                {formatValue(
                  kickoffWeather.windSpeedKilometresPerHour,
                  ' km/h',
                )}
              </dd>
            </div>
          </dl>
          <p>
            Geometry answers whether the stadium blocks the sun. Radiation
            estimates how strong unobstructed sunlight may feel.
          </p>
        </div>
      )}
    </div>
  );
}
