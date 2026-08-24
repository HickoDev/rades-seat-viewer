import { DateTime } from 'luxon';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { useStadiumStore } from '../state/useStadiumStore';

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
  const setMatchTime = useStadiumStore((state) => state.setMatchTime);
  const toggleSunSimulation = useStadiumStore(
    (state) => state.toggleSunSimulation,
  );

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
    </div>
  );
}
