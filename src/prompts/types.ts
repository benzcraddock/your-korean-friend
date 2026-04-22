export type TTSVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export type Persona = {
  id: string;
  displayName: string;
  koreanName: string;
  age: number;
  gender: 'f' | 'm' | 'nb';
  region: string;
  tts: {
    voice: TTSVoice;
  };
  shortDescription: string;
  systemPrompt: string;
};
