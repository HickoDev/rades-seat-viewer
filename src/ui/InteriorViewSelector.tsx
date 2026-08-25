import {
  interiorCalibrationViews,
  type InteriorCalibrationViewId,
} from '../camera/interiorCalibrationViews';
import { useStadiumStore } from '../state/useStadiumStore';

export function InteriorViewSelector() {
  const selectedViewId = useStadiumStore((state) => state.calibrationViewId);
  const selectCalibrationView = useStadiumStore(
    (state) => state.selectCalibrationView,
  );

  return (
    <label className="section-select">
      <span>Interior comparison view</span>
      <select
        aria-label="Choose an interior comparison view"
        value={selectedViewId ?? ''}
        onChange={(event) => {
          if (event.target.value) {
            selectCalibrationView(
              event.target.value as InteriorCalibrationViewId,
            );
          }
        }}
      >
        <option value="">Select a reference viewpoint</option>
        {interiorCalibrationViews.map((view) => (
          <option key={view.id} value={view.id}>
            {view.label}
          </option>
        ))}
      </select>
    </label>
  );
}
