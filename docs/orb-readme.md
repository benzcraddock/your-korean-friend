# Orb component — Claude Code integration guide

Reference implementation of Minji's presence sphere for "Your Korean Friend" (PRD section 5.3.1).

## What this is

A single-file React Three Fiber component that renders a dark blue sphere with:

- PBR material and environment-mapped reflections
- Animated 3D simplex noise driving surface light/dark drift
- Fresnel edge glow
- Five conversation states (`idle`, `minji_speaking`, `user_listening`, `user_speaking`, `processing`)
- Smooth state transitions via per-uniform lerping
- Amplitude-driven breathing, noise speed, and brightness
- Bloom post-processing for soft glow

Ready to drop into Electron + React + TypeScript. Target fidelity: roughly 80-90% of the reference image (`/mnt/user-data/uploads/1776891703675_image.png`).

## Quick start

### 1. Install dependencies

```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing
npm install -D @types/three
```

Optional for development tuning:

```bash
npm install leva
```

### 2. Drop the file in

Place `Orb.tsx` at `/src/components/Orb/Orb.tsx`. No other files needed yet — the shader, state params, mesh, and canvas wrapper are all inlined intentionally to make it a single working unit.

### 3. Verify it renders

Import and render the included `OrbDemo` component from any route. It has buttons for all five states and an amplitude slider, so you can confirm everything works visually before wiring real data.

```tsx
import { OrbDemo } from './components/Orb/Orb';

function App() {
  return <OrbDemo />;
}
```

You should see a dark sphere with slowly drifting light/dark patterns, subtle rim lighting, and a soft glow. Clicking state buttons should smoothly shift color and motion. Moving the amplitude slider should make it breathe.

### 4. Use in production

Once verified, replace `OrbDemo` with the actual `Orb` component wired to Zustand + Web Audio:

```tsx
import { Orb } from './components/Orb/Orb';
import { useSessionStore } from './state/sessionStore';
import { useAudioAmplitude } from './hooks/useAudioAmplitude';

function SessionScreen() {
  const orbState = useSessionStore((s) => s.orbState);
  const amplitude = useAudioAmplitude();

  return <Orb state={orbState} amplitude={amplitude} size={280} />;
}
```

## Integration tasks for Claude Code

These are the follow-up tasks to wire the orb into the real session flow:

### Task 1: Web Audio amplitude hook

Create `/src/hooks/useAudioAmplitude.ts`. Subscribe to a shared Web Audio `AnalyserNode` that both the TTS `<audio>` playback and the mic `MediaStream` feed into. On each `requestAnimationFrame`, call `getByteFrequencyData()`, average the bins, normalize to 0..1, and return the current value. Return `0` when no audio source is active.

### Task 2: Orb state in Zustand sessionStore

Add an `orbState: OrbState` field to the session store, with setters called from the session state machine when transitions happen:

- On session start → `idle`
- When Minji's TTS starts playing → `minji_speaking`
- When TTS finishes and mic opens → `user_listening`
- When mic detects speech onset → `user_speaking`
- When waiting on Whisper or the judge LLM → `processing`
- On session end → `idle`

### Task 3: Refactor into the file structure from the PRD

Once the inline version is confirmed working, split into the PRD section 5.3.1 structure:

```
src/components/Orb/
├── Orb.tsx           # Canvas wrapper, public API
├── OrbSphere.tsx     # Mesh + shader material + useFrame
├── orbShader.ts      # vertexShader + fragmentShader string exports
├── orbStates.ts      # STATE_PARAMS map
└── index.ts          # re-exports
```

This keeps the GLSL isolated for easier iteration and lets you import `OrbSphere` directly into other scenes later if needed (e.g. onboarding animation, settings screen preview).

### Task 4: Low-end hardware fallback

Add a setting in the Settings screen: "Reduced motion orb" toggle, default off. When on, render the v1.1 CSS/SVG orb instead of `<Orb>`. Also respect `prefers-reduced-motion: reduce` media query.

You can detect low-end hardware heuristically by reading `navigator.hardwareConcurrency` on app start. If less than 4, default the toggle to on.

### Task 5: Tune with leva

In dev mode, wrap shader uniform controls in leva so you can tweak `uNoiseScale`, `uFresnelPower`, base colors, and bloom intensity live. This will save hours of rebuild cycles when tuning the aesthetic. Remove leva hooks before shipping.

## Visual tuning notes

If the sphere doesn't match the reference aesthetic:

- **Too "planet-like" / too much color variation** → reduce the `liftedColor` multiplier in the fragment shader from `1.6` to something like `1.3`
- **Not enough surface movement** → increase `uNoiseScale` (e.g. from 1.8 to 2.5) or raise the idle `noiseSpeed` slightly
- **Edge glow too strong** → raise `uFresnelPower` (higher = thinner edge)
- **Too dark overall** → raise ambient light intensity, or swap environment preset from `night` to `warehouse`
- **Reflections too distracting** → lower `Bloom` intensity, or replace the `<Environment>` preset with a custom HDR that has less contrast

The reference image has very moody, low-contrast lighting with only one or two brighter surface patches visible at a time. If it looks too busy, reduce noise variance.

## Known limitations

- **The reference image shows subsurface-scattering-like depth** that isn't fully captured here. True volumetric interiors would require raymarching (PRD section 5.3.1 flags this as an optional v2.2 enhancement). The current implementation approximates it with surface noise, which is 60-70% there.
- **Performance on older Intel integrated graphics** may dip below 60fps. The low-end fallback toggle (Task 4) addresses this.
- **Canvas is 280x280 by default**; the sphere itself fills only the central ~180px. If the orb feels small in the layout, pass a larger `size` prop rather than scaling the whole container.

## PRD cross-references

- Section 5.3 — Orb progression across versions
- Section 5.3.1 — Full R3F sphere specification
- Section 3.2 — Conversation screen layout
- Section 6 — v2.0 roadmap entry
