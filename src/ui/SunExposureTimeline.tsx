import { DateTime } from 'luxon';

import { useStadiumStore } from '../state/useStadiumStore';

function formatTime(iso: string | null) {
  return iso ? DateTime.fromISO(iso).toFormat('HH:mm') : '—';
}

export function SunExposureTimeline() {
  const showSunSimulation = useStadiumStore((state) => state.showSunSimulation);
  const selectedSeat = useStadiumStore((state) => state.selectedSeat);
  const matchStartIso = useStadiumStore((state) => state.matchStartIso);
  const result = useStadiumStore((state) => state.sunExposureResult);

  if (!showSunSimulation) return null;
  if (selectedSeat === null) {
    return (
      <p className="simulation-message">Choose a seat to calculate exposure.</p>
    );
  }
  if (!matchStartIso) {
    return <p className="simulation-message">Choose a match date and time.</p>;
  }
  if (!result) {
    return <p className="simulation-message">Calculating stadium shade…</p>;
  }

  const { summary } = result;
  return (
    <div className="sun-timeline">
      <div
        className="sun-timeline__bar"
        role="img"
        aria-label={`${summary.directSunMinutes} minutes direct sun and ${summary.shadedMinutes} minutes shaded`}
      >
        {result.samples.map((sample) => (
          <span
            key={sample.timestampIso}
            className={`sun-sample sun-sample--${sample.geometricExposure}`}
            title={`${formatTime(sample.timestampIso)} · ${sample.geometricExposure}`}
          />
        ))}
      </div>
      <div className="sun-legend" aria-hidden="true">
        <span>
          <i className="legend-direct" />
          Direct sun
        </span>
        <span>
          <i className="legend-shadow" />
          Stadium shade
        </span>
        <span>
          <i className="legend-night" />
          Sun down
        </span>
      </div>
      <dl className="sun-summary">
        <div>
          <dt>Direct sun</dt>
          <dd>{summary.directSunMinutes.toFixed(0)} min</dd>
        </div>
        <div>
          <dt>Shaded</dt>
          <dd>{summary.shadedMinutes.toFixed(0)} min</dd>
        </div>
        <div>
          <dt>Exposed</dt>
          <dd>{summary.exposedPercent.toFixed(0)}%</dd>
        </div>
        <div>
          <dt>Peak glare</dt>
          <dd>{summary.peakGlareRisk}</dd>
        </div>
        <div>
          <dt>Shade begins</dt>
          <dd>{formatTime(summary.firstEntersShadeIso)}</dd>
        </div>
        <div>
          <dt>Sunset</dt>
          <dd>{formatTime(summary.sunsetIso)}</dd>
        </div>
      </dl>
    </div>
  );
}
