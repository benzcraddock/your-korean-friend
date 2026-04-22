export type Speaker = 'minji' | 'user';

export type Turn = {
  id: string;
  speaker: Speaker;
  ko: string;
  en: string;
  pending?: boolean;
  score?: {
    semantic: number;
    pronunciation: number;
  };
};

export type Hint = {
  id: string;
  ko: string;
  en: string;
};

export type ThemeKey =
  | 'intro'
  | 'cafe'
  | 'weekend'
  | 'directions'
  | 'food'
  | 'free';

export type Theme = {
  key: ThemeKey;
  ko: string;
  en: string;
};

export type Difficulty = 'beginner' | 'intermediate' | 'adaptive';

export type LengthMinutes = 1 | 2 | 5 | 10;

export type OrbState = 'idle' | 'minji' | 'user';

export type Screen = 'landing' | 'session' | 'recap' | 'settings';

export type RecapSummary = {
  turnsCompleted: number;
  avgSemantic: number;
  avgPronunciation: number;
  newVocabulary: Array<{ ko: string; en: string }>;
  transcript: Turn[];
};
