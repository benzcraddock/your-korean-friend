import { useEffect, useRef } from 'react';
import type { Turn } from '../types';

type Props = {
  turns: Turn[];
};

export function TranscriptView({ turns }: Props) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns.length]);

  return (
    <div
      className="relative w-[60%] max-w-[640px] h-[300px]"
      style={{
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 0, #000 72px, #000 calc(100% - 20px), transparent 100%)',
        maskImage:
          'linear-gradient(to bottom, transparent 0, #000 72px, #000 calc(100% - 20px), transparent 100%)',
      }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="h-full flex flex-col justify-end gap-3 px-2 pb-2">
          {turns.map((t, i) => {
            const isLast = i === turns.length - 1;
            return <Bubble key={t.id} turn={t} emphasized={isLast} />;
          })}
          <div ref={endRef} />
        </div>
      </div>
    </div>
  );
}

function Bubble({ turn, emphasized }: { turn: Turn; emphasized: boolean }) {
  const isUser = turn.speaker === 'user';
  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      style={{
        opacity: emphasized ? 1 : 0.55,
        animation: 'bubble-in 250ms ease-out',
        transition: 'opacity 400ms ease',
      }}
    >
      <div
        className="max-w-[85%] px-3 py-2"
        style={{
          border: '1px solid #E8E6E0',
          background: isUser ? '#111111' : 'transparent',
          color: isUser ? '#F8F7F4' : '#111111',
          borderRadius: 6,
        }}
      >
        {turn.pending ? (
          <PendingDots />
        ) : (
          <>
            <div className="font-ko text-[17px] leading-snug">{turn.ko}</div>
            <div
              className="text-xs mt-0.5"
              style={{ color: isUser ? '#CFCEC8' : '#666666' }}
            >
              {turn.en}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PendingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-ink2"
          style={{
            animation: `pulse-dot 1.2s ease-in-out ${i * 0.18}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
