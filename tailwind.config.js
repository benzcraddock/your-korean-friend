/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F8F7F4',
        ink: '#111111',
        ink2: '#666666',
        muted: '#E8E6E0',
        accent: '#2B6CFF',
      },
      fontFamily: {
        sans: [
          'Inter',
          'Pretendard',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
        ko: [
          'Pretendard',
          'Inter',
          'system-ui',
          '-apple-system',
          'Apple SD Gothic Neo',
          'Noto Sans KR',
          'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        display: '-0.02em',
      },
      borderRadius: {
        pill: '999px',
      },
    },
  },
  plugins: [],
};
