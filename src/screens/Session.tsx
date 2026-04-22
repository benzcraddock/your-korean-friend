import { useEffect, useRef, useState } from 'react';
import { HintCards } from '../components/HintCards';
import { Orb } from '../components/Orb';
import { SessionTimer, TurnTimer } from '../components/Timer';
import { TranscriptView } from '../components/TranscriptView';
import { Wordmark } from '../components/Wordmark';
import { MOCK_HINTS, MOCK_TURNS } from '../data/mockConversation';
import { useSessionStore } from '../state/sessionStore';
import type { Turn } from '../types';

const TURN_TOTAL = 20;

export function Session() {
  const {
    config,
    turns,
    pushTurn,
    orb,
    setOrb,
    sessionRemaining,
    setSessionRemaining,
    turnRemaining,
    setTurnRemaining,
    hintsVisible,
    setHintsVisible,
    goTo,
  } = useSessionStore();

  const [selectedHint, setSelectedHint] = useState<string | null>(null);
  const mockIndex = useRef(0);

  // Initialize hints visibility from config
  useEffect(() => {
    setHintsVisible(config.hintsOn);
  }, [config.hintsOn, setHintsVisible]);

  // Session countdown
  useEffect(() => {
    if (sessionRemaining <= 0) {
      goTo('recap');
      return;
    }
    const id = window.setInterval(() => {
      setSessionRemaining(Math.max(0, useSessionStore.getState().sessionRemaining - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [sessionRemaining, setSessionRemaining, goTo]);

  // Mock conversation playback — cycles through MOCK_TURNS
  useEffect(() => {
    const tick = () => {
      const next = MOCK_TURNS[mockIndex.current % MOCK_TURNS.length];
      const turn: Turn = {
        ...next,
        id: `${next.id}-${mockIndex.current}`,
      };
      pushTurn(turn);
      setOrb(next.speaker === 'minji' ? 'minji' : 'user');
      mockIndex.current += 1;
      setTurnRemaining(TURN_TOTAL);
    };

    tick();
    const id = window.setInterval(tick, 3600);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Per-turn countdown
  useEffect(() => {
    const id = window.setInterval(() => {
      setTurnRemaining(Math.max(0, useSessionStore.getState().turnRemaining - 0.2));
    }, 200);
    return () => window.clearInterval(id);
  }, [setTurnRemaining]);

  const recording = orb === 'user';

  return (
    <div className="h-full flex flex-col">
      <header className="app-drag flex items-center justify-between px-6 pt-6">
        <div className="app-no-drag">
          <Wordmark />
        </div>
        <div className="app-no-drag flex items-center gap-4">
          <SessionTimer seconds={sessionRemaining} />
          <button
            onClick={() => goTo('recap')}
            className="text-xs text-ink2 hover:text-ink transition-colors"
          >
            End
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        <Orb state={orb} size={180} />
        <TranscriptView turns={turns} />
      </main>

      <footer className="px-6 pb-8 flex flex-col items-center gap-4">
        {hintsVisible && (
          <HintCards
            hints={MOCK_HINTS}
            selectedId={selectedHint}
            onSelect={(h) => setSelectedHint(h.id)}
          />
        )}
        <TurnTimer remaining={turnRemaining} total={TURN_TOTAL} recording={recording} />
      </footer>
    </div>
  );
}
