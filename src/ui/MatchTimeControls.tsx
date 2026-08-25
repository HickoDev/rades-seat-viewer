import { DateTime } from 'luxon';

import { radesStadiumConfig } from '../stadium/config/radesStadiumConfig';
import { useStadiumStore } from '../state/useStadiumStore';
import { useSunPreview } from '../sunlight/useSunPreview';

function formatMatchDate(iso: string) {
  return DateTime.fromISO(iso, { setZone: true })
    .setZone(radesStadiumConfig.identity.timezone)
    .toFormat('ccc, dd LLL yyyy');
}

function formatMatchTime(iso: string) {
  return DateTime.fromISO(iso, { setZone: true })
    .setZone(radesStadiumConfig.identity.timezone)
    .toFormat('HH:mm');
}

function getCardinalDirection(azimuthRadians: number) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const degrees = ((azimuthRadians * 180) / Math.PI + 360) % 360;
  return {
    degrees,
    label: directions[Math.round(degrees / 45) % directions.length],
  };
}

export function MatchTimeControls() {
  const matchStartIso = useStadiumStore((state) => state.matchStartIso);
  const matchEndIso = useStadiumStore((state) => state.matchEndIso);
  const sunPreviewIso = useStadiumStore((state) => state.sunPreviewIso);
  const openMatchSetup = useStadiumStore((state) => state.openMatchSetup);
  const setSunPreviewTime = useStadiumStore((state) => state.setSunPreviewTime);
  const sunPreview = useSunPreview();

  if (!matchStartIso || !matchEndIso) return null;

  const previewWindowStart = DateTime.fromISO(matchStartIso, {
    setZone: true,
  }).minus({ minutes: 30 });
  const previewWindowEnd = DateTime.fromISO(matchEndIso, { setZone: true });
  const previewTime = DateTime.fromISO(sunPreviewIso ?? matchStartIso, {
    setZone: true,
  });
  const previewMaximum = Math.max(
    0,
    Math.round(previewWindowEnd.diff(previewWindowStart, 'minutes').minutes),
  );
  const previewValue = Math.min(
    previewMaximum,
    Math.max(
      0,
      Math.round(previewTime.diff(previewWindowStart, 'minutes').minutes),
    ),
  );
  const sunBearing = sunPreview
    ? getCardinalDirection(sunPreview.position.azimuthRadians)
    : null;

  return (
    <article className="match-summary" aria-label="Selected match time">
      <div className="match-summary__heading">
        <div>
          <span>Match selected</span>
          <strong>{formatMatchDate(matchStartIso)}</strong>
          <small>
            {formatMatchTime(matchStartIso)}–{formatMatchTime(matchEndIso)} /{' '}
            Tunis time
          </small>
        </div>
        <button type="button" onClick={openMatchSetup}>
          Change
        </button>
      </div>

      <label className="sun-preview-control">
        <span>
          Preview conditions
          <strong>
            {formatMatchTime(previewTime.toISO() ?? matchStartIso)}
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
            setSunPreviewTime(next.toISO() ?? matchStartIso);
          }}
        />
        <small>
          {sunPreview
            ? sunPreview.altitudeDegrees > 0
              ? `Sun ${sunBearing?.label} / ${Math.round(sunBearing?.degrees ?? 0)}Â° geographic azimuth / ${Math.round(sunPreview.altitudeDegrees)}Â° above the horizon`
              : sunPreview.isNight
                ? 'Night sky / stadium floodlights on'
                : 'Twilight / floodlights warming up'
            : 'Move through the event to preview conditions.'}
        </small>
      </label>
    </article>
  );
}
