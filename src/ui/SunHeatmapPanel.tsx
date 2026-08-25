import { useState } from 'react';

import { countHeatmapClasses } from '../sunlight/sunlightHeatmap';
import type {
  HeatmapResolution,
  HeatmapTimeMode,
} from '../sunlight/sunlightHeatmap.types';
import { useSunlightHeatmap } from '../sunlight/useSunlightHeatmap';
import { useStadiumStore } from '../state/useStadiumStore';
import { StadiumExposureMap } from './StadiumExposureMap';

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
  const [mapOpen, setMapOpen] = useState(false);
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
            <small>Open the dedicated 2D top view</small>
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
          <button
            className="heatmap-open-map"
            type="button"
            onClick={() => setMapOpen(true)}
          >
            <span>Open top-view exposure plan</span>
            <span aria-hidden="true">↗</span>
          </button>
          <small>
            Chair and spectator clothing colors stay unchanged. The plan uses
            labels—not color alone—and shows sunlight exposure, not measured
            temperature.
          </small>
        </div>
      )}
      {result && (
        <StadiumExposureMap
          open={mapOpen}
          result={result}
          onClose={() => setMapOpen(false)}
        />
      )}
    </div>
  );
}
