import { Landing } from './screens/Landing';
import { Recap } from './screens/Recap';
import { Session } from './screens/Session';
import { Settings } from './screens/Settings';
import { useSessionStore } from './state/sessionStore';

export default function App() {
  const screen = useSessionStore((s) => s.screen);
  return (
    <div className="h-screen w-screen overflow-hidden bg-bg text-ink">
      {screen === 'landing' && <Landing />}
      {screen === 'session' && <Session />}
      {screen === 'recap' && <Recap />}
      {screen === 'settings' && <Settings />}
    </div>
  );
}
