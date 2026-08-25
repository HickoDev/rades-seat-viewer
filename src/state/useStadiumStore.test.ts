import { afterEach, describe, expect, it } from 'vitest';

import { useStadiumStore } from './useStadiumStore';

describe('stadium selection state', () => {
  afterEach(() => useStadiumStore.getState().returnToOverview());

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
});
