import { DateTime } from 'luxon';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { useStadiumStore } from '../state/useStadiumStore';

const inputFormat = "yyyy-LL-dd'T'HH:mm";

function createDefaultWindow() {
  const now = DateTime.now().setZone(radesStadiumConfig.identity.timezone);
  const start = now.plus({ hours: 1 }).startOf('hour');
  return {
    start: start.toFormat(inputFormat),
    end: start.plus({ hours: 2 }).toFormat(inputFormat),
  };
}

function toInputValue(iso: string | null, fallback: string) {
  return iso
    ? DateTime.fromISO(iso, { setZone: true })
        .setZone(radesStadiumConfig.identity.timezone)
        .toFormat(inputFormat)
    : fallback;
}

export function MatchSetupDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const matchSetupOpen = useStadiumStore((state) => state.matchSetupOpen);
  const matchStartIso = useStadiumStore((state) => state.matchStartIso);
  const matchEndIso = useStadiumStore((state) => state.matchEndIso);
  const setMatchTime = useStadiumStore((state) => state.setMatchTime);
  const closeMatchSetup = useStadiumStore((state) => state.closeMatchSetup);
  const [defaults] = useState(createDefaultWindow);
  const [startValue, setStartValue] = useState(() =>
    toInputValue(matchStartIso, defaults.start),
  );
  const [endValue, setEndValue] = useState(() =>
    toInputValue(matchEndIso, defaults.end),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (matchSetupOpen && !dialog.open) dialog.showModal();
    if (!matchSetupOpen && dialog.open) dialog.close();
  }, [matchSetupOpen]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const start = DateTime.fromFormat(startValue, inputFormat, {
      zone: radesStadiumConfig.identity.timezone,
    });
    const end = DateTime.fromFormat(endValue, inputFormat, {
      zone: radesStadiumConfig.identity.timezone,
    });
    if (!start.isValid || !end.isValid) {
      setErrorMessage('Enter a valid kickoff and expected end time.');
      return;
    }
    if (end <= start) {
      setErrorMessage('Expected end must be later than kickoff.');
      return;
    }
    setMatchTime(start.toISO() ?? '', end.toISO() ?? '');
  };

  return (
    <dialog
      ref={dialogRef}
      className="match-setup-dialog"
      aria-labelledby="match-setup-title"
      onCancel={(event) => {
        if (!matchStartIso) event.preventDefault();
      }}
      onClose={() => {
        if (matchSetupOpen && matchStartIso) closeMatchSetup();
      }}
    >
      <form method="dialog" onSubmit={handleSubmit}>
        <div className="setup-progress" aria-label="Step 1 of 2">
          <span>1</span>
          <i />
          <span>2</span>
        </div>
        <p className="setup-eyebrow">Step 1 of 2 / Match conditions</p>
        <h2 id="match-setup-title">When is the match?</h2>
        <p className="setup-intro">
          Set the local match time once. Radès View will prepare the sun,
          stadium shade, weather, and seat heatmap automatically.
        </p>

        <div className="setup-time-grid">
          <label>
            <span>Kickoff</span>
            <input
              aria-label="Match kickoff time"
              autoFocus
              type="datetime-local"
              value={startValue}
              onChange={(event) => {
                const nextStart = event.target.value;
                setStartValue(nextStart);
                const parsedStart = DateTime.fromFormat(
                  nextStart,
                  inputFormat,
                  { zone: radesStadiumConfig.identity.timezone },
                );
                if (parsedStart.isValid) {
                  setEndValue(
                    parsedStart.plus({ hours: 2 }).toFormat(inputFormat),
                  );
                }
              }}
              required
            />
          </label>
          <label>
            <span>Expected end</span>
            <input
              aria-label="Expected match end time"
              type="datetime-local"
              value={endValue}
              onChange={(event) => setEndValue(event.target.value)}
              required
            />
          </label>
        </div>

        {errorMessage && (
          <p className="setup-error" role="alert">
            {errorMessage}
          </p>
        )}

        <div
          className="setup-automatic-list"
          aria-label="Prepared automatically"
        >
          <span>Automatic</span>
          <ul>
            <li>Local sun and stadium shadow</li>
            <li>Weather and feels-like temperature</li>
            <li>Readable seat exposure map</li>
          </ul>
        </div>

        <button className="setup-primary-action" type="submit">
          Continue to seat selection
          <span aria-hidden="true">→</span>
        </button>
        <small className="setup-timezone">
          Times use Africa/Tunis. Weather is shown only inside the reliable
          forecast window.
        </small>
      </form>
    </dialog>
  );
}
