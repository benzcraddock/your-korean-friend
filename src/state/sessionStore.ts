import { create } from 'zustand';
import type {
  Difficulty,
  LengthMinutes,
  OrbState,
  Screen,
  ThemeKey,
  Turn,
} from '../types';

type SessionConfig = {
  lengthMin: LengthMinutes;
  theme: ThemeKey;
  difficulty: Difficulty;
  hintsOn: boolean;
  personaId: string;
};

type State = {
  screen: Screen;
  config: SessionConfig;
  turns: Turn[];
  orb: OrbState;
  sessionRemaining: number;
  turnRemaining: number;
  turnTotal: number;
  hintsVisible: boolean;
  mockMode: boolean;
};

type Actions = {
  goTo: (s: Screen) => void;
  setLength: (m: LengthMinutes) => void;
  setTheme: (t: ThemeKey) => void;
  setDifficulty: (d: Difficulty) => void;
  toggleHints: () => void;
  setPersonaId: (id: string) => void;
  resetForNewSession: () => void;
  pushTurn: (t: Turn) => void;
  setOrb: (s: OrbState) => void;
  setSessionRemaining: (s: number) => void;
  setTurnRemaining: (s: number) => void;
  setHintsVisible: (v: boolean) => void;
  setMockMode: (v: boolean) => void;
};

const DEFAULT_CONFIG: SessionConfig = {
  lengthMin: 2,
  theme: 'cafe',
  difficulty: 'beginner',
  hintsOn: false,
  personaId: 'minji',
};

const MOCK_KEY = 'ykf:mockMode';

function readMockMode(): boolean {
  try {
    const v = localStorage.getItem(MOCK_KEY);
    return v === null ? true : v === 'true';
  } catch {
    return true;
  }
}

function writeMockMode(v: boolean) {
  try {
    localStorage.setItem(MOCK_KEY, String(v));
  } catch {
    /* ignore */
  }
}

export const useSessionStore = create<State & Actions>((set) => ({
  screen: 'landing',
  config: DEFAULT_CONFIG,
  turns: [],
  orb: 'idle',
  sessionRemaining: DEFAULT_CONFIG.lengthMin * 60,
  turnRemaining: 20,
  turnTotal: 20,
  hintsVisible: false,
  mockMode: readMockMode(),

  goTo: (screen) => set({ screen }),
  setLength: (lengthMin) =>
    set((s) => ({
      config: { ...s.config, lengthMin },
      sessionRemaining: lengthMin * 60,
    })),
  setTheme: (theme) => set((s) => ({ config: { ...s.config, theme } })),
  setDifficulty: (difficulty) =>
    set((s) => ({ config: { ...s.config, difficulty } })),
  toggleHints: () =>
    set((s) => ({ config: { ...s.config, hintsOn: !s.config.hintsOn } })),
  setPersonaId: (personaId) =>
    set((s) => ({ config: { ...s.config, personaId } })),
  resetForNewSession: () =>
    set((s) => ({
      turns: [],
      orb: 'idle',
      sessionRemaining: s.config.lengthMin * 60,
      turnRemaining: 20,
      hintsVisible: s.config.hintsOn,
    })),
  pushTurn: (t) => set((s) => ({ turns: [...s.turns, t] })),
  setOrb: (orb) => set({ orb }),
  setSessionRemaining: (n) => set({ sessionRemaining: n }),
  setTurnRemaining: (n) => set({ turnRemaining: n }),
  setHintsVisible: (hintsVisible) => set({ hintsVisible }),
  setMockMode: (v) => {
    writeMockMode(v);
    set({ mockMode: v });
  },
}));
