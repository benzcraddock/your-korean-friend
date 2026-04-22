import type { Hint } from '../types';

type Props = {
  hints: Hint[];
  selectedId?: string | null;
  onSelect?: (h: Hint) => void;
};

export function HintCards({ hints, selectedId, onSelect }: Props) {
  return (
    <div className="w-full max-w-md flex flex-col gap-2">
      {hints.map((h) => {
        const active = selectedId === h.id;
        return (
          <button
            key={h.id}
            onClick={() => onSelect?.(h)}
            className="group text-left px-4 py-3 border transition-all"
            style={{
              borderColor: active ? '#111111' : '#E8E6E0',
              background: active ? '#111111' : 'transparent',
              color: active ? '#F8F7F4' : '#111111',
            }}
          >
            <div className="font-ko text-[17px] leading-snug">{h.ko}</div>
            <div
              className="text-xs mt-1"
              style={{ color: active ? '#CFCEC8' : '#666666' }}
            >
              {h.en}
            </div>
          </button>
        );
      })}
    </div>
  );
}
