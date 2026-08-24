import { create } from 'zustand';

import type { SunExposureSimulation } from '../sunlight/sunlight.types';
import type {
  HeatmapResolution,
  SunHeatmapResult,
} from '../sunlight/sunlightHeatmap.types';

export type CameraMode = 'overview' | 'section' | 'seat';
export type QualityMode = 'auto' | 'low' | 'high';

export type StadiumState = {
  cameraMode: CameraMode;
  selectedSectionId: string | null;
  selectedRow: number | null;
  selectedSeat: number | null;
  matchStartIso: string | null;
  matchEndIso: string | null;
  showSunSimulation: boolean;
  showWeather: boolean;
  showSunHeatmap: boolean;
  showDebugGuides: boolean;
  sunExposureResult: SunExposureSimulation | null;
  heatmapResolution: HeatmapResolution;
  sunHeatmapResult: SunHeatmapResult | null;
  qualityMode: QualityMode;
  selectSection: (sectionId: string) => void;
  selectRow: (row: number) => void;
  selectSeat: (row: number, seat: number) => void;
  setMatchTime: (startIso: string, endIso: string) => void;
  returnToOverview: () => void;
  toggleDebugGuides: () => void;
  toggleSunSimulation: () => void;
  toggleWeather: () => void;
  toggleSunHeatmap: () => void;
  setHeatmapResolution: (resolution: HeatmapResolution) => void;
  setSunExposureResult: (result: SunExposureSimulation | null) => void;
  setSunHeatmapResult: (result: SunHeatmapResult | null) => void;
  setQualityMode: (qualityMode: QualityMode) => void;
};

const initialState = {
  cameraMode: 'overview' as const,
  selectedSectionId: null,
  selectedRow: null,
  selectedSeat: null,
  matchStartIso: null,
  matchEndIso: null,
  showSunSimulation: false,
  showWeather: false,
  showSunHeatmap: false,
  showDebugGuides: false,
  sunExposureResult: null,
  heatmapResolution: 'section' as const,
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
    }),
  selectSeat: (row, seat) =>
    set({
      cameraMode: 'seat',
      selectedRow: row,
      selectedSeat: seat,
    }),
  selectRow: (row) =>
    set({ cameraMode: 'section', selectedRow: row, selectedSeat: null }),
  setMatchTime: (startIso, endIso) =>
    set({
      matchStartIso: startIso,
      matchEndIso: endIso,
      sunHeatmapResult: null,
    }),
  returnToOverview: () =>
    set({
      cameraMode: 'overview',
      selectedSectionId: null,
      selectedRow: null,
      selectedSeat: null,
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
  setSunExposureResult: (sunExposureResult) => set({ sunExposureResult }),
  setSunHeatmapResult: (sunHeatmapResult) => set({ sunHeatmapResult }),
  setQualityMode: (qualityMode) => set({ qualityMode }),
}));
