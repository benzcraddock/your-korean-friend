import type { OrbState } from '../types';

type Props = {
  state: OrbState;
  size?: number;
};

const STATE_STYLES: Record<OrbState, { opacity: number; scale: number; hue: string }> = {
  idle: { opacity: 0.55, scale: 0.98, hue: '#CFCEC8' },
  minji: { opacity: 1, scale: 1, hue: '#2B6CFF' },
  user: { opacity: 0.9, scale: 1.02, hue: '#111111' },
};

export function Orb({ state, size = 220 }: Props) {
  const s = STATE_STYLES[state];
  return (
    <div
      className="relative"
      style={{
        width: size,
        height: size,
        animation: state === 'minji' ? 'orb-breathe 3.2s ease-in-out infinite' : undefined,
        transition: 'opacity 600ms ease, transform 600ms ease',
        opacity: s.opacity,
        transform: `scale(${s.scale})`,
      }}
      aria-label={`orb state: ${state}`}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${s.hue} 55%, #1a1a1a 100%)`,
          filter: 'blur(0.3px)',
          boxShadow:
            '0 30px 80px -20px rgba(17,17,17,0.25), inset 0 0 40px rgba(255,255,255,0.15)',
        }}
      />
      <div
        className="absolute inset-0 rounded-full mix-blend-overlay"
        style={{
          background:
            'radial-gradient(circle at 70% 80%, rgba(255,255,255,0.35), transparent 55%)',
        }}
      />
    </div>
  );
}
