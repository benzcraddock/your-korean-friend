import type { ReactNode } from 'react';

type Props = {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
};

export function Pill({ active, onClick, children }: Props) {
  return (
    <button
      onClick={onClick}
      className="px-3.5 py-1.5 text-sm border transition-all"
      style={{
        borderColor: active ? '#111111' : '#E8E6E0',
        background: active ? '#111111' : 'transparent',
        color: active ? '#F8F7F4' : '#111111',
        borderRadius: 999,
      }}
    >
      {children}
    </button>
  );
}
