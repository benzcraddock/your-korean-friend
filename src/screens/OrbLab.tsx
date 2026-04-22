import { OrbDemo } from '../components/Orb/Orb';
import { useSessionStore } from '../state/sessionStore';

export function OrbLab() {
  const { goTo } = useSessionStore();
  return (
    <div className="relative h-full w-full">
      <button
        onClick={() => goTo('settings')}
        className="absolute top-4 right-4 z-10 text-xs px-3 py-1.5 rounded"
        style={{
          background: '#1f2833',
          color: '#e8ecf2',
          border: '1px solid #2a3542',
        }}
      >
        Close
      </button>
      <OrbDemo />
    </div>
  );
}
