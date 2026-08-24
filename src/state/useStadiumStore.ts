import { create } from 'zustand';

export type CameraMode = 'overview' | 'section' | 'seat';

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
  selectSection: (sectionId: string) => void;
  selectSeat: (row: number, seat: number) => void;
  setMatchTime: (startIso: string, endIso: string) => void;
  returnToOverview: () => void;
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
  setMatchTime: (startIso, endIso) =>
    set({ matchStartIso: startIso, matchEndIso: endIso }),
  returnToOverview: () =>
    set({
      cameraMode: 'overview',
      selectedSectionId: null,
      selectedRow: null,
      selectedSeat: null,
    }),
}));
