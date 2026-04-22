import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';

// StrictMode intentionally disabled: it double-mounts in dev which breaks
// @react-three/postprocessing's EffectComposer internal state and causes
// the orb canvas to flicker. Production builds were unaffected either way.
createRoot(document.getElementById('root')!).render(<App />);
