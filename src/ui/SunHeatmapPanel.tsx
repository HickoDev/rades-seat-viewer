import { countHeatmapClasses } from '../sunlight/sunlightHeatmap';
import type {
  HeatmapResolution,
  HeatmapTimeMode,
} from '../sunlight/sunlightHeatmap.types';
import { useSunlightHeatmap } from '../sunlight/useSunlightHeatmap';
import { useStadiumStore } from '../state/useStadiumStore';

const matchLabels = {
  'mostly-sunny': 'Mostly sunny',
  'partially-sunny': 'Partly sunny',
  'mostly-shaded': 'Mostly shaded',
  'fully-shaded': 'Fully shaded',
} as const;

const instantLabels = {
  'mostly-sunny': 'Direct sunlight',
  'partially-sunny': 'Mixed sun and shade',
  'mostly-shaded': 'Mostly in shade',
  'fully-shaded': 'In stadium shade',
} as const;

export function SunHeatmapPanel() {
  const matchStartIso = useStadiumStore((state) => state.matchStartIso);
  const resolution = useStadiumStore((state) => state.heatmapResolution);
  const timeMode = useStadiumStore((state) => state.heatmapTimeMode);
  const setResolution = useStadiumStore((state) => state.setHeatmapResolution);
  const setTimeMode = useStadiumStore((state) => state.setHeatmapTimeMode);
  const { errorMessage, result, status } = useSunlightHeatmap();
  const counts = result ? countHeatmapClasses(result.cells) : null;
  const labels = timeMode === 'instant' ? instantLabels : matchLabels;

  if (!matchStartIso) return null;

  return (
    <div className="heatmap-panel">
      <div className="condition-card__title">
        <div>
          <span
            className="condition-icon condition-icon--map"
            aria-hidden="true"
          >
            ◫
          </span>
          <div>
            <strong>Stadium exposure map</strong>
            <small>Shown on spectator clothing</small>
          </div>
        </div>
        <span className="automatic-badge">Automatic</span>
      </div>

      <details className="heatmap-settings">
        <summary>Map settings</summary>
        <div className="heatmap-options">
          <label className="heatmap-resolution">
            <span>Time basis</span>
            <select
              aria-label="Heatmap time basis"
              value={timeMode}
              onChange={(event) =>
                setTimeMode(event.target.value as HeatmapTimeMode)
              }
            >
              <option value="instant">Current preview time</option>
              <option value="match">Whole-match exposure</option>
            </select>
          </label>
          <label className="heatmap-resolution">
            <span>Detail</span>
            <select
              aria-label="Heatmap representative detail"
              value={resolution}
              onChange={(event) =>
                setResolution(event.target.value as HeatmapResolution)
              }
            >
              <option value="section">By section</option>
              <option value="row">By row</option>
            </select>
          </label>
        </div>
      </details>

      {status === 'loading' && (
        <p className="simulation-message">
          Calculating stadium sun and shade in the background…
        </p>
      )}
      {status === 'error' && (
        <p className="forecast-unavailable">{errorMessage}</p>
      )}
      {status === 'ready' && result && counts && (
        <div className="heatmap-result" aria-live="polite">
          <p>
            <strong>{result.cells.length}</strong> mapped groups /{' '}
            {result.resolution === 'section' ? 'section' : 'row'} detail /{' '}
            {result.timeMode === 'instant'
              ? 'current preview time'
              : 'whole match'}
          </p>
          <ul aria-label="Sunlight heatmap classifications">
            {Object.entries(labels).map(([classification, label]) => (
              <li key={classification}>
                <i
                  className={`heatmap-swatch heatmap-swatch--${classification}`}
                />
                <span>{label}</span>
                <strong>{counts[classification as keyof typeof counts]}</strong>
              </li>
            ))}
          </ul>
          <small>
            Chair colors stay unchanged; exposure color on spectator clothing
            remains visible in occupied stands. Labels—not color alone—carry the
            meaning. This is sunlight exposure, not measured temperature.
          </small>
        </div>
      )}
    </div>
  );
}
