import type { Level } from './levels';

const PROGRESS_KEY = 'neuropuzzle-progress';

export interface LevelCompletion {
  accuracy: number;
  at: number;
}

export interface ProgressState {
  completedLevels: Record<string, LevelCompletion>;
  xp: number;
  stars: number;
  modesVisited: Partial<Record<'campaign' | 'sandbox' | 'daily' | 'custom', boolean>>;
}

const defaultProgress = (): ProgressState => ({
  completedLevels: {},
  xp: 0,
  stars: 0,
  modesVisited: {},
});

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      ...defaultProgress(),
      ...parsed,
      completedLevels: parsed.completedLevels ?? {},
      modesVisited: parsed.modesVisited ?? {},
    };
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(state: ProgressState) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(state));
}

export function isLevelUnlocked(level: Level): boolean {
  if (!level.unlockedBy.length) return true;
  const prog = loadProgress();
  return level.unlockedBy.every((id) => prog.completedLevels[id]);
}

export function recordLevelComplete(
  levelId: string,
  accuracy: number,
  rewards: { xp: number; stars: number }
): ProgressState {
  const prog = loadProgress();
  const prev = prog.completedLevels[levelId];
  const best = prev ? Math.max(prev.accuracy, accuracy) : accuracy;
  prog.completedLevels[levelId] = { accuracy: best, at: Date.now() };
  if (!prev) {
    prog.xp += rewards.xp;
    prog.stars += rewards.stars;
  }
  saveProgress(prog);
  return prog;
}

export function visitMode(mode: keyof ProgressState['modesVisited']) {
  const prog = loadProgress();
  prog.modesVisited = { ...prog.modesVisited, [mode]: true };
  saveProgress(prog);
}

const SETTINGS_KEY = 'neuropuzzle-settings';

export interface GameSettings {
  soundVolume: number;
  reducedMotion: boolean;
  theme: string;
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return { soundVolume: 70, reducedMotion: false, theme: 'dark-neon' };
    }
    return { soundVolume: 70, reducedMotion: false, theme: 'dark-neon', ...JSON.parse(raw) };
  } catch {
    return { soundVolume: 70, reducedMotion: false, theme: 'dark-neon' };
  }
}

export function saveSettings(s: GameSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}
