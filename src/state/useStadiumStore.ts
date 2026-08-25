import { create } from 'zustand';

import type { SunExposureSimulation } from '../sunlight/sunlight.types';
import type {
  HeatmapResolution,
  HeatmapTimeMode,
  SunHeatmapResult,
} from '../sunlight/sunlightHeatmap.types';
import type { ViewingPositionKind } from '../seats/viewingPositions';
import type { InteriorCalibrationViewId } from '../camera/interiorCalibrationViews';

export type CameraMode = 'overview' | 'section' | 'seat';
export type QualityMode = 'auto' | 'low' | 'high';

export type StadiumState = {
  cameraMode: CameraMode;
  selectedSectionId: string | null;
  selectedRow: number | null;
  selectedSeat: number | null;
  selectedViewKind: ViewingPositionKind | null;
  calibrationViewId: InteriorCalibrationViewId | null;
  matchSetupOpen: boolean;
  matchStartIso: string | null;
  matchEndIso: string | null;
  sunPreviewIso: string | null;
  showSunSimulation: boolean;
  showWeather: boolean;
  showSunHeatmap: boolean;
  showDebugGuides: boolean;
  sunExposureResult: SunExposureSimulation | null;
  heatmapResolution: HeatmapResolution;
  heatmapTimeMode: HeatmapTimeMode;
  sunHeatmapResult: SunHeatmapResult | null;
  qualityMode: QualityMode;
  selectSection: (sectionId: string) => void;
  selectRow: (row: number) => void;
  selectSeat: (row: number, seat: number) => void;
  selectTerracePosition: (
    sectionId: string,
    row: number,
    position: number,
  ) => void;
  selectCalibrationView: (viewId: InteriorCalibrationViewId) => void;
  setMatchTime: (startIso: string, endIso: string) => void;
  openMatchSetup: () => void;
  closeMatchSetup: () => void;
  setSunPreviewTime: (timestampIso: string) => void;
  returnToOverview: () => void;
  toggleDebugGuides: () => void;
  toggleSunSimulation: () => void;
  toggleWeather: () => void;
  toggleSunHeatmap: () => void;
  setHeatmapResolution: (resolution: HeatmapResolution) => void;
  setHeatmapTimeMode: (timeMode: HeatmapTimeMode) => void;
  setSunExposureResult: (result: SunExposureSimulation | null) => void;
  setSunHeatmapResult: (result: SunHeatmapResult | null) => void;
  setQualityMode: (qualityMode: QualityMode) => void;
};

const initialState = {
  cameraMode: 'overview' as const,
  selectedSectionId: null,
  selectedRow: null,
  selectedSeat: null,
  selectedViewKind: null,
  calibrationViewId: null,
  matchSetupOpen: true,
  matchStartIso: null,
  matchEndIso: null,
  sunPreviewIso: null,
  showSunSimulation: false,
  showWeather: false,
  showSunHeatmap: false,
  showDebugGuides: false,
  sunExposureResult: null,
  heatmapResolution: 'section' as const,
  heatmapTimeMode: 'instant' as const,
  sunHeatmapResult: null,
  qualityMode: 'auto' as const,
};

export const useStadiumStore = create<StadiumState>((set) => ({
  ...initialState,
  selectSection: (sectionId) =>
    set({
      cameraMode: 'section',
      selectedSectionId: sectionId,
      selectedRow: null,
      selectedSeat: null,
      selectedViewKind: null,
      calibrationViewId: null,
    }),
  selectSeat: (row, seat) =>
    set({
      cameraMode: 'seat',
      selectedRow: row,
      selectedSeat: seat,
      selectedViewKind: 'seat',
      calibrationViewId: null,
    }),
  selectRow: (row) =>
    set({
      cameraMode: 'section',
      selectedRow: row,
      selectedSeat: null,
      selectedViewKind: null,
      calibrationViewId: null,
    }),
  selectTerracePosition: (sectionId, row, position) =>
    set({
      cameraMode: 'seat',
      selectedSectionId: sectionId,
      selectedRow: row,
      selectedSeat: position,
      selectedViewKind: 'terrace',
      calibrationViewId: null,
    }),
  selectCalibrationView: (calibrationViewId) =>
    set({
      cameraMode: 'section',
      calibrationViewId,
      selectedSectionId: null,
      selectedRow: null,
      selectedSeat: null,
      selectedViewKind: null,
    }),
  setMatchTime: (startIso, endIso) =>
    set({
      matchStartIso: startIso,
      matchEndIso: endIso,
      sunPreviewIso: startIso,
      matchSetupOpen: false,
      showSunSimulation: true,
      showWeather: true,
      showSunHeatmap: true,
      sunHeatmapResult: null,
    }),
  openMatchSetup: () => set({ matchSetupOpen: true }),
  closeMatchSetup: () => set({ matchSetupOpen: false }),
  setSunPreviewTime: (sunPreviewIso) =>
    set({ sunPreviewIso, sunHeatmapResult: null }),
  returnToOverview: () =>
    set({
      cameraMode: 'overview',
      selectedSectionId: null,
      selectedRow: null,
      selectedSeat: null,
      selectedViewKind: null,
      calibrationViewId: null,
    }),
  toggleDebugGuides: () =>
    set((state) => ({ showDebugGuides: !state.showDebugGuides })),
  toggleSunSimulation: () =>
    set((state) => ({ showSunSimulation: !state.showSunSimulation })),
  toggleWeather: () => set((state) => ({ showWeather: !state.showWeather })),
  toggleSunHeatmap: () =>
    set((state) => ({ showSunHeatmap: !state.showSunHeatmap })),
  setHeatmapResolution: (heatmapResolution) =>
    set({ heatmapResolution, sunHeatmapResult: null }),
  setHeatmapTimeMode: (heatmapTimeMode) =>
    set({ heatmapTimeMode, sunHeatmapResult: null }),
  setSunExposureResult: (sunExposureResult) => set({ sunExposureResult }),
  setSunHeatmapResult: (sunHeatmapResult) => set({ sunHeatmapResult }),
  setQualityMode: (qualityMode) => set({ qualityMode }),
}));
