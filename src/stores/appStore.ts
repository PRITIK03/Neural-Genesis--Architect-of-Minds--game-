import { create } from 'zustand';

type Screen = 'mainMenu' | 'campaign' | 'sandbox' | 'daily' | 'settings' | 'network';

interface AppState {
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentScreen: 'mainMenu',
  setScreen: (screen) => set({ currentScreen: screen }),
}));