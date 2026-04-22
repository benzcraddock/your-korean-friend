import { useState } from 'react';
import { Orb } from '../components/Orb';
import { Pill } from '../components/Pill';
import { Wordmark } from '../components/Wordmark';
import { THEMES } from '../data/themes';
import { useSessionStore } from '../state/sessionStore';
import type { Difficulty, LengthMinutes, ThemeKey } from '../types';

const LENGTHS: LengthMinutes[] = [1, 2, 5, 10];
const DIFFICULTIES: { key: Difficulty; label: string }[] = [
  { key: 'beginner', label: 'Beginner' },
  { key: 'intermediate', label: 'Intermediate' },
  { key: 'adaptive', label: 'Adaptive' },
];

export function Landing() {
  const [expanded, setExpanded] = useState(false);
  const { config, goTo, setLength, setTheme, setDifficulty, toggleHints, resetForNewSession } =
    useSessionStore();

  const onStart = () => {
    resetForNewSession();
    goTo('session');
  };

  return (
    <div className="h-full flex flex-col">
      <header className="app-drag flex items-center justify-between px-6 pt-6">
        <div className="app-no-drag">
          <Wordmark />
        </div>
        <button
          className="app-no-drag text-xs text-ink2 hover:text-ink transition-colors"
          onClick={() => goTo('settings')}
          aria-label="Settings"
        >
          Settings
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div
          className="flex flex-col items-center gap-10 transition-all duration-500"
          style={{ transform: expanded ? 'translateY(-24px)' : 'translateY(0)' }}
        >
          <Orb state="idle" size={expanded ? 180 : 220} />

          {!expanded ? (
            <button
              className="text-ink text-lg tracking-tight hover:opacity-70 transition-opacity"
              onClick={() => setExpanded(true)}
            >
              Let&apos;s talk
            </button>
          ) : (
            <div className="flex flex-col items-center gap-6 max-w-xl w-full">
              <Section label="Length">
                {LENGTHS.map((m) => (
                  <Pill
                    key={m}
                    active={config.lengthMin === m}
                    onClick={() => setLength(m)}
                  >
                    {m} min
                  </Pill>
                ))}
              </Section>

              <Section label="Theme">
                {THEMES.map((t) => (
                  <Pill
                    key={t.key}
                    active={config.theme === t.key}
                    onClick={() => setTheme(t.key as ThemeKey)}
                  >
                    <span className="font-ko">{t.ko}</span>
                    <span className="text-xs opacity-70 ml-1.5">{t.en}</span>
                  </Pill>
                ))}
              </Section>

              <Section label="Difficulty">
                {DIFFICULTIES.map((d) => (
                  <Pill
                    key={d.key}
                    active={config.difficulty === d.key}
                    onClick={() => setDifficulty(d.key)}
                  >
                    {d.label}
                  </Pill>
                ))}
              </Section>

              <div className="flex items-center gap-3 pt-2">
                <span className="text-sm text-ink2">Hints</span>
                <button
                  onClick={toggleHints}
                  className="relative w-10 h-5 rounded-full transition-colors"
                  style={{ background: config.hintsOn ? '#111111' : '#E8E6E0' }}
                  aria-pressed={config.hintsOn}
                  aria-label="Toggle hints"
                >
                  <span
                    className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-bg transition-transform"
                    style={{
                      transform: config.hintsOn ? 'translateX(20px)' : 'translateX(0)',
                    }}
                  />
                </button>
              </div>

              <button
                onClick={onStart}
                className="mt-4 px-6 py-2.5 text-[15px] border border-ink bg-ink text-bg hover:opacity-80 transition-opacity"
                style={{ borderRadius: 999 }}
              >
                Start
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-[11px] tracking-[0.12em] uppercase text-ink2">{label}</div>
      <div className="flex flex-wrap justify-center gap-2">{children}</div>
    </div>
  );
}
