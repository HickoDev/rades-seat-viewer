import { afterEach, describe, expect, it } from 'vitest';

import { useStadiumStore } from './useStadiumStore';

describe('stadium selection state', () => {
  afterEach(() => {
    useStadiumStore.getState().returnToOverview();
    useStadiumStore.setState({
      matchSetupOpen: true,
      matchStartIso: null,
      matchEndIso: null,
      sunPreviewIso: null,
      showSunSimulation: false,
      showWeather: false,
      showSunHeatmap: false,
      heatmapTimeMode: 'instant',
    });
  });

  it('enters first-person mode for a serializable terrace position', () => {
    useStadiumStore.getState().selectTerracePosition('lower-01', 16, 12);

    expect(useStadiumStore.getState()).toMatchObject({
      cameraMode: 'seat',
      selectedSectionId: 'lower-01',
      selectedRow: 16,
      selectedSeat: 12,
      selectedViewKind: 'terrace',
    });
  });

  it('marks an individually selected chair as a seat view', () => {
    useStadiumStore.getState().selectSection('lower-05');
    useStadiumStore.getState().selectSeat(5, 3);

    expect(useStadiumStore.getState()).toMatchObject({
      cameraMode: 'seat',
      selectedViewKind: 'seat',
    });
  });

  it('opens a serializable interior comparison camera', () => {
    useStadiumStore.getState().selectCalibrationView('honor-balcony');

    expect(useStadiumStore.getState()).toMatchObject({
      cameraMode: 'section',
      calibrationViewId: 'honor-balcony',
      selectedSectionId: null,
      selectedViewKind: null,
    });
  });

  it('starts every match condition automatically after setup', () => {
    useStadiumStore
      .getState()
      .setMatchTime('2026-08-26T16:00:00+01:00', '2026-08-26T18:00:00+01:00');

    expect(useStadiumStore.getState()).toMatchObject({
      matchSetupOpen: false,
      sunPreviewIso: '2026-08-26T16:00:00+01:00',
      showSunSimulation: true,
      showWeather: true,
      showSunHeatmap: true,
      heatmapTimeMode: 'instant',
    });
  });
});
