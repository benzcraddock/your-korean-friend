import { Wordmark } from '../components/Wordmark';
import { MOCK_TURNS, MOCK_VOCAB } from '../data/mockConversation';
import { useSessionStore } from '../state/sessionStore';

export function Recap() {
  const { turns, goTo, resetForNewSession } = useSessionStore();
  const displayTurns = turns.length > 0 ? turns : MOCK_TURNS;

  const userTurns = displayTurns.filter((t) => t.speaker === 'user' && t.score);
  const avgSemantic = avg(userTurns.map((t) => t.score!.semantic));
  const avgPronunciation = avg(userTurns.map((t) => t.score!.pronunciation));

  return (
    <div className="h-full flex flex-col">
      <header className="app-drag flex items-center justify-between px-6 pt-6">
        <div className="app-no-drag">
          <Wordmark />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-16">
        <div className="max-w-2xl mx-auto pt-12">
          <div className="text-[11px] tracking-[0.12em] uppercase text-ink2 mb-3">
            Session recap
          </div>
          <h1 className="text-[32px] leading-tight tracking-display mb-12">
            Nice work. Here&apos;s how it went.
          </h1>

          <div className="grid grid-cols-3 gap-6 mb-12">
            <Stat label="Turns" value={`${displayTurns.length}`} />
            <Stat label="Semantic" value={pct(avgSemantic)} />
            <Stat label="Pronunciation" value={pct(avgPronunciation)} />
          </div>

          <Section title="New vocabulary">
            <ul className="flex flex-col gap-2">
              {MOCK_VOCAB.map((v) => (
                <li
                  key={v.ko}
                  className="flex items-baseline gap-3 border-b border-muted pb-2"
                >
                  <span className="font-ko text-[17px]">{v.ko}</span>
                  <span className="text-sm text-ink2">{v.en}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Transcript">
            <div className="flex flex-col gap-3">
              {displayTurns.map((t) => (
                <div
                  key={t.id}
                  className={`flex ${t.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[85%] px-3 py-2"
                    style={{
                      border: '1px solid #E8E6E0',
                      background: t.speaker === 'user' ? '#111111' : 'transparent',
                      color: t.speaker === 'user' ? '#F8F7F4' : '#111111',
                      borderRadius: 6,
                    }}
                  >
                    <div className="font-ko text-[16px] leading-snug">{t.ko}</div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: t.speaker === 'user' ? '#CFCEC8' : '#666666' }}
                    >
                      {t.en}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <div className="flex gap-3 mt-12">
            <button
              onClick={() => {
                resetForNewSession();
                goTo('session');
              }}
              className="px-5 py-2.5 text-sm border border-ink bg-ink text-bg hover:opacity-80 transition-opacity"
              style={{ borderRadius: 999 }}
            >
              Start another session
            </button>
            <button
              onClick={() => goTo('landing')}
              className="px-5 py-2.5 text-sm border border-muted text-ink hover:border-ink transition-colors"
              style={{ borderRadius: 999 }}
            >
              Done
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function avg(xs: number[]) {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[11px] tracking-[0.12em] uppercase text-ink2">{label}</div>
      <div className="text-[28px] tracking-display tabular-nums">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="text-[11px] tracking-[0.12em] uppercase text-ink2 mb-3">{title}</div>
      {children}
    </section>
  );
}
