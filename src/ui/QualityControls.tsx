import type { QualityMode } from '../state/useStadiumStore';
import { useStadiumStore } from '../state/useStadiumStore';

export function QualityControls() {
  const qualityMode = useStadiumStore((state) => state.qualityMode);
  const setQualityMode = useStadiumStore((state) => state.setQualityMode);

  return (
    <label className="quality-control">
      <span>
        <strong>Rendering quality</strong>
        <small>
          Auto uses high detail on desktop and lighter detail on compact screens
        </small>
      </span>
      <select
        aria-label="Rendering quality"
        value={qualityMode}
        onChange={(event) => setQualityMode(event.target.value as QualityMode)}
      >
        <option value="auto">Auto</option>
        <option value="low">Low</option>
        <option value="high">High</option>
      </select>
    </label>
  );
}
