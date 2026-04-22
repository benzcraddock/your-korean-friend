import type { Hint, Turn } from '../types';

export const MOCK_TURNS: Turn[] = [
  {
    id: 't1',
    speaker: 'minji',
    ko: '안녕하세요! 오늘 기분이 어때요?',
    en: 'Hi! How are you feeling today?',
  },
  {
    id: 't2',
    speaker: 'user',
    ko: '오늘은 좀 피곤해요.',
    en: "I'm a bit tired today.",
    score: { semantic: 0.88, pronunciation: 0.74 },
  },
  {
    id: 't3',
    speaker: 'minji',
    ko: '그래요? 커피 한잔 어때요?',
    en: 'Really? How about a cup of coffee?',
  },
  {
    id: 't4',
    speaker: 'user',
    ko: '좋아요. 아메리카노 주세요.',
    en: 'Sounds good. Americano please.',
    score: { semantic: 0.91, pronunciation: 0.82 },
  },
  {
    id: 't5',
    speaker: 'minji',
    ko: '따뜻한 거요, 아니면 차가운 거요?',
    en: 'Hot or iced?',
  },
  {
    id: 't6',
    speaker: 'user',
    ko: '따뜻한 아메리카노로 할게요.',
    en: "I'll go with a hot americano.",
    score: { semantic: 0.93, pronunciation: 0.79 },
  },
  {
    id: 't7',
    speaker: 'minji',
    ko: '네, 금방 가져다 드릴게요!',
    en: "Okay, I'll bring it right away!",
  },
];

export const MOCK_HINTS: Hint[] = [
  { id: 'h1', ko: '따뜻한 걸로 주세요.', en: 'Hot, please.' },
  { id: 'h2', ko: '차가운 거 주세요.', en: 'Iced, please.' },
  { id: 'h3', ko: '잠깐만요, 생각 중이에요.', en: 'One second, still thinking.' },
];

export const MOCK_VOCAB = [
  { ko: '피곤하다', en: 'to be tired' },
  { ko: '따뜻하다', en: 'to be warm' },
  { ko: '금방', en: 'soon / right away' },
];
