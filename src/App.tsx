import { Suspense, lazy } from 'react';
import { Landing } from './screens/Landing';
import { Recap } from './screens/Recap';
import { Session } from './screens/Session';
import { Settings } from './screens/Settings';
import { useSessionStore } from './state/sessionStore';

const OrbLab = lazy(() =>
  import('./screens/OrbLab').then((m) => ({ default: m.OrbLab })),
);

export default function App() {
  const screen = useSessionStore((s) => s.screen);
  return (
    <div className="h-screen w-screen overflow-hidden bg-bg text-ink">
      {screen === 'landing' && <Landing />}
      {screen === 'session' && <Session />}
      {screen === 'recap' && <Recap />}
      {screen === 'settings' && <Settings />}
      {screen === 'orb-lab' && (
        <Suspense
          fallback={
            <div className="h-full flex items-center justify-center text-ink2 text-sm">
              Loading orb…
            </div>
          }
        >
          <OrbLab />
        </Suspense>
      )}
    </div>
  );
}
