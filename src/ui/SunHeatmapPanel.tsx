import { countHeatmapClasses } from '../sunlight/sunlightHeatmap';
import type { HeatmapResolution } from '../sunlight/sunlightHeatmap.types';
import { useSunlightHeatmap } from '../sunlight/useSunlightHeatmap';
import { useStadiumStore } from '../state/useStadiumStore';

const labels = {
  'mostly-sunny': 'Mostly sunny',
  'partially-sunny': 'Partially sunny',
  'mostly-shaded': 'Mostly shaded',
  'fully-shaded': 'Fully shaded',
} as const;

export function SunHeatmapPanel() {
  const showSunHeatmap = useStadiumStore((state) => state.showSunHeatmap);
  const matchStartIso = useStadiumStore((state) => state.matchStartIso);
  const resolution = useStadiumStore((state) => state.heatmapResolution);
  const toggleSunHeatmap = useStadiumStore((state) => state.toggleSunHeatmap);
  const setResolution = useStadiumStore((state) => state.setHeatmapResolution);
  const { errorMessage, result, status } = useSunlightHeatmap();
  const counts = result ? countHeatmapClasses(result.cells) : null;

  return (
    <div className="heatmap-panel">
      <button
        className={`simulation-toggle ${showSunHeatmap ? 'simulation-toggle--active' : ''}`}
        type="button"
        aria-pressed={showSunHeatmap}
        onClick={toggleSunHeatmap}
      >
        <span aria-hidden="true">◫</span>
        {showSunHeatmap ? 'Sunlight heatmap on' : 'Enable sunlight heatmap'}
      </button>

      {showSunHeatmap && (
        <label className="heatmap-resolution">
          <span>Representative detail</span>
          <select
            aria-label="Heatmap representative detail"
            value={resolution}
            onChange={(event) =>
              setResolution(event.target.value as HeatmapResolution)
            }
          >
            <option value="section">Section samples</option>
            <option value="row">Row samples</option>
          </select>
        </label>
      )}
      {showSunHeatmap && !matchStartIso && (
        <p className="simulation-message">Choose a match date and time.</p>
      )}
      {showSunHeatmap && status === 'loading' && (
        <p className="simulation-message">
          Calculating representative shade in the background…
        </p>
      )}
      {showSunHeatmap && status === 'error' && (
        <p className="forecast-unavailable">{errorMessage}</p>
      )}
      {showSunHeatmap && status === 'ready' && result && counts && (
        <div className="heatmap-result" aria-live="polite">
          <p>
            <strong>{result.cells.length}</strong> representative groups ·{' '}
            {resolution === 'section' ? 'section' : 'row'} detail
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
            Cached by event time and geometry version. Colours are
            representative estimates, not surveyed seat guarantees.
          </small>
        </div>
      )}
    </div>
  );
}
