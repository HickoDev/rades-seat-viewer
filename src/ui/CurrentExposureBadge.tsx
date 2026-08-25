import { DateTime } from 'luxon';

import { useStadiumStore } from '../state/useStadiumStore';

const exposureCopy = {
  'direct-sun': {
    label: 'Direct sun at this time',
    detail: 'No major stadium structure blocks the sun ray.',
  },
  'stadium-shadow': {
    label: 'Stadium shade at this time',
    detail: 'A major roof or structure blocks the sun ray.',
  },
  'sun-below-horizon': {
    label: 'Sun below the horizon',
    detail: 'Stadium floodlights provide the visible lighting.',
  },
} as const;

export function CurrentExposureBadge() {
  const selectedSeat = useStadiumStore((state) => state.selectedSeat);
  const previewIso = useStadiumStore((state) => state.sunPreviewIso);
  const result = useStadiumStore((state) => state.sunExposureResult);

  if (selectedSeat === null || !previewIso || !result) return null;

  const preview = DateTime.fromISO(previewIso, { setZone: true });
  const sample = result.samples.reduce<(typeof result.samples)[number] | null>(
    (closest, candidate) => {
      if (!closest) return candidate;
      const candidateDifference = Math.abs(
        DateTime.fromISO(candidate.timestampIso, { setZone: true }).diff(
          preview,
          'minutes',
        ).minutes,
      );
      const closestDifference = Math.abs(
        DateTime.fromISO(closest.timestampIso, { setZone: true }).diff(
          preview,
          'minutes',
        ).minutes,
      );
      return candidateDifference < closestDifference ? candidate : closest;
    },
    null,
  );

  if (!sample) return null;
  const copy = exposureCopy[sample.geometricExposure];

  return (
    <div
      className={`current-exposure current-exposure--${sample.geometricExposure}`}
      role="status"
    >
      <span aria-hidden="true" />
      <div>
        <strong>{copy.label}</strong>
        <small>{copy.detail}</small>
      </div>
      <time dateTime={sample.timestampIso}>
        {DateTime.fromISO(sample.timestampIso, { setZone: true }).toFormat(
          'HH:mm',
        )}
      </time>
    </div>
  );
}
