import { DateTime } from 'luxon';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { useStadiumStore } from '../state/useStadiumStore';
import { useSunPreview } from '../sunlight/useSunPreview';

const inputFormat = "yyyy-LL-dd'T'HH:mm";

function toInputValue(iso: string | null) {
  return iso
    ? DateTime.fromISO(iso, { setZone: true })
        .setZone(radesStadiumConfig.identity.timezone)
        .toFormat(inputFormat)
    : '';
}

function parseLocalInput(value: string) {
  return DateTime.fromFormat(value, inputFormat, {
    zone: radesStadiumConfig.identity.timezone,
  });
}

export function MatchTimeControls() {
  const matchStartIso = useStadiumStore((state) => state.matchStartIso);
  const matchEndIso = useStadiumStore((state) => state.matchEndIso);
  const showSunSimulation = useStadiumStore((state) => state.showSunSimulation);
  const sunPreviewIso = useStadiumStore((state) => state.sunPreviewIso);
  const setMatchTime = useStadiumStore((state) => state.setMatchTime);
  const setSunPreviewTime = useStadiumStore((state) => state.setSunPreviewTime);
  const toggleSunSimulation = useStadiumStore(
    (state) => state.toggleSunSimulation,
  );
  const sunPreview = useSunPreview();
  const previewWindowStart = matchStartIso
    ? DateTime.fromISO(matchStartIso, { setZone: true }).minus({ minutes: 30 })
    : null;
  const previewWindowEnd = matchEndIso
    ? DateTime.fromISO(matchEndIso, { setZone: true })
    : null;
  const previewTime = sunPreviewIso
    ? DateTime.fromISO(sunPreviewIso, { setZone: true })
    : matchStartIso
      ? DateTime.fromISO(matchStartIso, { setZone: true })
      : null;
  const previewMaximum =
    previewWindowStart && previewWindowEnd
      ? Math.max(
          0,
          Math.round(
            previewWindowEnd.diff(previewWindowStart, 'minutes').minutes,
          ),
        )
      : 0;
  const previewValue =
    previewWindowStart && previewTime
      ? Math.min(
          previewMaximum,
          Math.max(
            0,
            Math.round(previewTime.diff(previewWindowStart, 'minutes').minutes),
          ),
        )
      : 0;

  const useExampleTime = () => {
    const start = DateTime.now()
      .setZone(radesStadiumConfig.identity.timezone)
      .startOf('day')
      .set({ hour: 16 });
    setMatchTime(start.toISO() ?? '', start.plus({ hours: 2 }).toISO() ?? '');
  };

  return (
    <div className="match-time-controls">
      <div className="match-time-grid">
        <label>
          <span>Kickoff</span>
          <input
            aria-label="Match kickoff time"
            type="datetime-local"
            value={toInputValue(matchStartIso)}
            onChange={(event) => {
              const start = parseLocalInput(event.target.value);
              if (!start.isValid) return;
              const currentEnd = matchEndIso
                ? DateTime.fromISO(matchEndIso, { setZone: true })
                : start.plus({ hours: 2 });
              const end =
                currentEnd <= start ? start.plus({ hours: 2 }) : currentEnd;
              setMatchTime(start.toISO() ?? '', end.toISO() ?? '');
            }}
          />
        </label>
        <label>
          <span>Expected end</span>
          <input
            aria-label="Expected match end time"
            type="datetime-local"
            value={toInputValue(matchEndIso)}
            onChange={(event) => {
              const end = parseLocalInput(event.target.value);
              if (!end.isValid) return;
              const start = matchStartIso
                ? DateTime.fromISO(matchStartIso, { setZone: true })
                : end.minus({ hours: 2 });
              setMatchTime(start.toISO() ?? '', end.toISO() ?? '');
            }}
          />
        </label>
      </div>
      <button className="text-button" type="button" onClick={useExampleTime}>
        Use today at 16:00 as an example
      </button>
      <button
        className={`simulation-toggle ${showSunSimulation ? 'simulation-toggle--active' : ''}`}
        type="button"
        aria-pressed={showSunSimulation}
        onClick={toggleSunSimulation}
      >
        <span aria-hidden="true">☀</span>
        {showSunSimulation ? 'Sun simulation on' : 'Enable sun simulation'}
      </button>
      {showSunSimulation && previewWindowStart && previewWindowEnd && (
        <label className="sun-preview-control">
          <span>
            Preview time
            <strong>
              {previewTime
                ?.setZone(radesStadiumConfig.identity.timezone)
                .toFormat('HH:mm') ?? '--:--'}
            </strong>
          </span>
          <input
            aria-label="Sun preview time"
            type="range"
            min={0}
            max={previewMaximum}
            step={5}
            value={previewValue}
            onChange={(event) => {
              const next = previewWindowStart.plus({
                minutes: Number(event.target.value),
              });
              setSunPreviewTime(next.toISO() ?? '');
            }}
          />
          <small>
            {sunPreview
              ? sunPreview.altitudeDegrees > 0
                ? `Sun ${Math.round(sunPreview.altitudeDegrees)} degrees above the horizon`
                : sunPreview.isNight
                  ? 'Night sky / stadium floodlights on'
                  : 'Twilight / floodlights warming up'
              : 'Move through the event to preview daylight.'}
          </small>
        </label>
      )}
    </div>
  );
}
