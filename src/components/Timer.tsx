type Props = {
  seconds: number;
};

function fmt(total: number) {
  const m = Math.floor(Math.max(0, total) / 60);
  const s = Math.max(0, total) % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function SessionTimer({ seconds }: Props) {
  return (
    <div className="font-mono text-sm tracking-tight text-ink tabular-nums">
      {fmt(seconds)}
    </div>
  );
}

type BarProps = {
  remaining: number;
  total: number;
  recording?: boolean;
};

export function TurnTimer({ remaining, total, recording }: BarProps) {
  const pct = Math.max(0, Math.min(1, remaining / total));
  return (
    <div className="w-full max-w-md flex items-center gap-3">
      <span
        className="w-2 h-2 rounded-full"
        style={{
          background: recording ? '#E0423C' : '#BDBAB1',
          transition: 'background 200ms ease',
        }}
        aria-hidden
      />
      <div className="h-[2px] flex-1 bg-muted relative overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-ink"
          style={{
            width: `${pct * 100}%`,
            transition: 'width 200ms linear',
          }}
        />
      </div>
      <span className="font-mono text-xs text-ink2 tabular-nums w-8 text-right">
        {Math.ceil(remaining)}
      </span>
    </div>
  );
}
