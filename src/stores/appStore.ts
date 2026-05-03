import { create } from 'zustand';

export type Screen =
  | 'mainMenu'
  | 'campaign'
  | 'network'
  | 'results'
  | 'sandbox'
  | 'daily'
  | 'settings'
  | 'custom'
  | 'leaderboard'
  | 'profile';

interface AppState {
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentScreen: 'mainMenu',
  setScreen: (screen) => set({ currentScreen: screen }),
}));