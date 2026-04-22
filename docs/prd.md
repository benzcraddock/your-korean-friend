# Your Korean Friend — Product Requirements Document

**Owner:** Ben Craddock
**Status:** Draft v1.0
**Last updated:** April 22, 2026
**Target:** Desktop app (Electron + React), Mac-first

---

## 1. Product summary

Your Korean Friend is a desktop app that drops the user into a timed, spoken Korean dialogue with an AI conversation partner named 민지 (Minji). Sessions are short (1 to 10 minutes), and every turn the user must respond in spoken Korean within a per-turn timer. If the user stalls or answers in English, Minji offers three scaffolded response options (shown in Korean and English, speakable on hover) that the user can pick and then speak aloud to continue the conversation.

The design philosophy is Worldcoin-minimal: one screen, one action, massive whitespace, typographic hierarchy doing the work. The AI presence is visualized as a central orb (static gradient in v1, animated Siri-style orb in v3).

### The problem it solves

Language apps teach vocabulary but rarely force conversation under time pressure. Speaking practice with real humans is expensive, intimidating, and hard to schedule. Your Korean Friend compresses that loop into a 2-minute session you can run before bed.

### Success criteria

- User completes at least one full session in their first app open
- User returns for a second session within 48 hours
- User reports feeling "pushed but not defeated" after a session
- Pronunciation judgments feel fair (not frustratingly strict, not uselessly lenient)

---

## 2. Core user flow (v1)

1. User opens app. Landing screen: wordmark top-left, centered orb, "Let's talk" CTA below orb.
2. User clicks "Let's talk". Below the CTA, three inline selectors reveal: session length (1/2/5/10 min), theme (6 options), difficulty (beginner/intermediate/adaptive). A "Hints on" toggle also appears.
3. User clicks "Start" (CTA replaces "Let's talk"). Orb enters active state. Session timer appears top-right.
4. Minji greets the user in Korean. The greeting is spoken aloud via TTS and displayed as dual transcript (Korean + English) in the conversation area.
5. A 20-second per-turn response timer starts after Minji finishes speaking.
6. User speaks in Korean. Audio is captured, transcribed by Whisper, and passed to the LLM judge.
7. One of four branches runs:
   - **Valid Korean response:** LLM judge scores semantic appropriateness and pronunciation. Minji replies, loop continues.
   - **Response in English:** Minji gently says "한국어로 말해 주세요" ("please speak in Korean") and the timer resets once.
   - **Timer expires with no response:** Minji says "천천히 해도 돼요" and the 3 hint options auto-reveal, overriding the hints-off toggle.
   - **User requested hints (toggle on):** 3 suggested responses display every turn, each clickable and hoverable. Hover plays TTS preview. Click selects it and the user must then speak the selected phrase aloud to submit it as their turn.
8. Loop continues until the session timer hits zero.
9. Session ends. Recap screen shows: turns completed, average pronunciation score, new vocabulary encountered, scrollable transcript. Transcript saved to local storage.

---

## 3. Feature specifications

### 3.1 Landing screen

- Three visible elements: wordmark ("Your Korean Friend" top-left), centered orb, "Let's talk" CTA below orb.
- Clicking "Let's talk" does not navigate. It reveals inline selectors on the same screen, pushing the orb up slightly.
- Selectors: length pill group (1, 2, 5, 10 min), theme pill group (6 options, see 3.3), difficulty pill group (Beginner, Intermediate, Adaptive), hints toggle (Off by default).
- "Start" button replaces "Let's talk" once selections are made.
- Light mode only in v1. Background: off-white (#F8F7F4 or similar). Text: near-black. Accent: single muted color for active states.

### 3.2 Conversation screen

- Session timer: top-right, monospaced, counts down.
- Orb: centered, static radial gradient in v1. Changes subtle color/opacity state between "Minji speaking", "user's turn", and "idle".
- Live transcript (iMessage-style): central region of the screen, flowing around or below the orb. See 3.2.1 for full spec.
- Per-turn response timer: appears at the bottom of the screen during user's turn. Subtle horizontal bar that depletes, plus numeric countdown.
- Hint panel (when triggered): appears above response timer. Three cards stacked vertically, each with Korean phrase (large), English translation (small), hover state that plays TTS preview. Click to select.
- When a hint is selected, card highlights and user is prompted to speak the phrase aloud. Same pronunciation judge runs on that attempt.
- Mic state indicator: subtle dot near orb or on the response timer bar. Red when recording, gray when idle.

### 3.2.1 Live transcript (iMessage-style)

The transcript is part of the visual experience, not just a utility log. It should feel like a living conversation, not a scrollback buffer.

- **Layout:** Chat bubbles, Minji left-aligned, user right-aligned. Centered column roughly 60% of viewport width.
- **Bubble content:** Korean phrase primary (larger, regular weight), English translation underneath in smaller, lighter weight. Minimal padding, flat background, minimal border-radius (matches Worldcoin restraint, not a typical chat app bubble).
- **Visible window:** Only the most recent 3-4 turns are visible at any time. No scrollbar.
- **Fade masks:** Top and bottom of the transcript container have soft gradient masks that fade content to transparent over roughly 60-80px. Older turns dissolve upward and out as new ones come in. New turns enter from the bottom and push everything up.
- **Auto-scroll:** Smooth scroll animation when a new turn arrives. Duration around 300ms, ease-out.
- **Bubble entry animation:** New bubbles fade in and translate up slightly (10-15px) over 250ms. Subtle, not bouncy.
- **Active turn emphasis:** The most recent bubble (whoever just spoke) gets a subtle opacity bump (100% vs 85% for older bubbles) so the eye knows where to land.
- **Partial transcript during user speech:** While Whisper is still processing, show a faint placeholder bubble with a pulsing dot, then replace with the transcribed text once it returns.
- **Does not block orb focus:** The orb remains the focal point. Transcript is supporting scenery. If the layout forces a choice, orb wins, transcript gets smaller.
- **Recap transcript differs:** The session recap screen shows the full transcript without fade masks, scrollable normally. That's the archival view. The in-session transcript is the cinematic view.

### 3.3 Themes (v1)

User picks one per session. Theme seeds Minji's opening and constrains topic drift.

1. 자기소개 — Introductions
2. 카페에서 — At a cafe
3. 주말 이야기 — Weekend talk
4. 길 찾기 — Directions
5. 음식 이야기 — Food talk
6. 자유 대화 — Freeform

### 3.4 Difficulty modes

- **Beginner:** Minji uses 존댓말, short sentences, common vocabulary. Suggested responses are simple.
- **Intermediate:** Mixes 존댓말 and 반말 depending on rapport, introduces past-tense verbs, particles like 에서, 으로, 한테.
- **Adaptive:** Starts Beginner. After 4 successful turns at current level, LLM judge decides whether to step up. User sees a subtle "Level: Beginner → Intermediate" toast when it shifts.
- User can manually switch difficulty mid-session via a small pill control in the top-right (below the session timer). Change applies on the next Minji turn.

### 3.5 Persona (Minji)

- 24-year-old Seoul native, warm and casual.
- Opens every new session in 존댓말. After 2-3 successful turns, shifts to 반말 if difficulty is Intermediate or Adaptive. Stays in 존댓말 throughout if Beginner.
- Voice: OpenAI TTS, Korean-capable voice (likely `shimmer` or `nova`, test both). Single voice in v1. Voice options in v2.
- Personality cues in the system prompt: curious, asks follow-up questions, gently corrects obvious errors by rephrasing them back naturally (not explicitly teaching).

### 3.6 Hint system

- User toggles hints On/Off per session at the start.
- **Hints On:** 3 response options appear every user turn.
- **Hints Off:** No options shown unless the per-turn timer expires without a valid response. Then the 3 options auto-reveal with Minji saying "천천히 해도 돼요".
- Hints are generated by the LLM from Minji's last turn, constrained to the current theme and difficulty level.
- Each hint card shows: Korean phrase (large, bold), romanization (optional toggle in settings, v2), English translation (small, light).
- Hover plays TTS preview of that phrase.
- Click selects it. User then has a fresh 20-second window to speak it aloud correctly. Pronunciation judge scores, conversation continues.

### 3.7 Pronunciation judge (LLM-as-judge)

- Input: user's Whisper transcript + expected text (if hint was chosen) or open expected intent (if free response).
- The LLM (GPT-4o or similar) returns a JSON verdict:
  ```json
  {
    "valid_korean": true,
    "semantic_match": 0.82,
    "pronunciation_estimate": 0.74,
    "detected_language": "ko",
    "feedback_note": "close, but 감사합니다 was slightly off on the last syllable"
  }
  ```
- Thresholds (tunable post-v1):
  - `valid_korean: false` or `detected_language: "en"` → English-response branch
  - `semantic_match < 0.4` → Minji asks for clarification rather than rejecting
  - Otherwise → valid, conversation continues
- Note: Whisper transcription loses pronunciation fidelity, so `pronunciation_estimate` is inherently an approximation. This is a known v1 limitation. v3 may add raw-audio-to-LLM or Azure phoneme scoring.

### 3.8 Session recap

- Shown when session timer hits zero.
- Displays: turns completed, average semantic match, average pronunciation estimate, list of new vocabulary Minji introduced (extracted by the LLM), full transcript.
- Two CTAs: "Start another session" and "Done".
- Transcript saved to local storage (SQLite or flat JSON) keyed by timestamp.
- v2 adds: history screen, vocabulary review.

### 3.9 Settings

- API keys: OpenAI (required for STT, TTS, LLM judge), ElevenLabs (optional, placeholder for v2).
- Keys stored in Electron `safeStorage` (OS keychain). Never written to plaintext config.
- Other settings: default session length, default theme, default difficulty, hints default state.
- Accessible via small gear icon in the top-right of the landing screen.

---

## 4. Technical architecture

### 4.1 Stack

- **Shell:** Electron (latest stable)
- **UI:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, custom design tokens matching Worldcoin-style minimalism
- **State:** Zustand (simpler than Redux for this scope)
- **Audio capture:** Web Audio API + `MediaRecorder` inside the renderer
- **IPC:** Electron IPC for secure API calls (keys never exposed to renderer)
- **Local storage:** `better-sqlite3` for transcripts, Electron `safeStorage` for keys
- **Packaging:** `electron-builder` for Mac DMG (v1), Windows later

### 4.2 External services

- **STT:** OpenAI Whisper API (`whisper-1`) for Korean transcription
- **TTS:** OpenAI TTS (`tts-1` or `tts-1-hd`), voice TBD via A/B test
- **Dialogue + judge LLM:** GPT-4o or GPT-4o-mini for cost. Single model handles both Minji's turns and the judge verdicts (two different prompts)

### 4.3 Security checklist (vibe security)

- All OpenAI calls go through the Electron main process, never the renderer
- API keys stored in OS keychain via `safeStorage`, never in plaintext
- User inputs sanitized before being embedded in LLM prompts
- Rate limiting on API calls (local token bucket, prevents runaway sessions burning the user's key)
- Logs scrub keys and full transcripts by default; opt-in verbose logging for debugging
- Error messages to the user stay vague ("Something went wrong, try again"); detailed errors only in dev console
- Dependencies pinned and updated monthly
- No frontend direct connections to OpenAI; renderer only talks to main process

### 4.4 File structure (proposed)

```
your-korean-friend/
├── electron/
│   ├── main.ts                  # Electron main process
│   ├── preload.ts               # Context bridge
│   ├── services/
│   │   ├── openai.ts            # All OpenAI API calls
│   │   ├── storage.ts           # SQLite + safeStorage
│   │   └── session.ts           # Session orchestration
│   └── ipc/
│       └── handlers.ts
├── src/
│   ├── App.tsx
│   ├── screens/
│   │   ├── Landing.tsx
│   │   ├── Session.tsx
│   │   └── Recap.tsx
│   ├── components/
│   │   ├── Orb.tsx
│   │   ├── Timer.tsx
│   │   ├── HintCards.tsx
│   │   └── TranscriptView.tsx
│   ├── state/
│   │   └── sessionStore.ts      # Zustand
│   ├── prompts/
│   │   ├── minji.ts             # Minji system prompt
│   │   └── judge.ts             # Judge system prompt
│   └── styles/
│       └── tokens.css
├── package.json
└── README.md
```

---

## 5. Design system

### 5.1 Worldcoin reference

Target aesthetic: `world.org/integrations`. Characteristics to copy:

- Off-white background, near-black text
- Huge whitespace between sections
- One accent color used sparingly
- Sans-serif with wide tracking on display text
- Buttons are flat rectangles, no gradients, minimal border-radius
- Hover states are subtle opacity shifts, not color inversions

### 5.2 Tokens (v1 proposed)

- Background: `#F8F7F4`
- Text primary: `#111111`
- Text secondary: `#666666`
- Accent: `#2B6CFF` (used for active pills, CTA hover, timer bar)
- Muted: `#E8E6E0`
- Font: Inter or a similar neutral sans
- Korean font fallback: Pretendard (widely-used modern Korean sans)

### 5.3 Orb (v1 → v2 progression)

- **v1 (v0.1 scaffold onward):** Static radial gradient, CSS only. Three states (idle, Minji speaking, user turn) via opacity and subtle scale changes.
- **v1.1:** CSS/SVG-based pulsing, amplitude-reactive via Web Audio `AnalyserNode`. Filter-based blur and animated pseudo-elements. Still cheap to run, no new dependencies.
- **v2:** React Three Fiber dark sphere with animated surface noise, PBR material, environment reflections, and real-time audio reactivity. See section 5.3.1 for full spec.

### 5.3.1 R3F sphere specification (v2)

**Reference aesthetic:** Dark blue sphere with moody marble-like surface, subtle fresnel edge lighting, environment-mapped reflections, and slow-drifting light/dark patterns that feel alive. Landing at roughly 80-90% fidelity to the reference image.

**Stack additions for v2:**

```
@react-three/fiber
@react-three/drei
@react-three/postprocessing
leva                          (dev-only, for tweaking shader params)
```

**Component architecture:**

```
src/components/Orb/
├── Orb.tsx                   # Wrapper, owns <Canvas>
├── OrbSphere.tsx             # The sphere mesh with shader material
├── orbShader.ts              # Vertex + fragment shader code
├── useOrbState.ts            # Subscribes to Zustand, returns uniform values
└── useAudioAmplitude.ts      # Web Audio AnalyserNode hook
```

**Material approach:**

Custom `ShaderMaterial` extending `MeshPhysicalMaterial` behavior:
- Base: dark blue (`#1a2530`) with metalness ~0.3, roughness ~0.35
- Surface noise: 3D simplex noise sampled from sphere's local position + time offset, modulating base color lightness to create drifting light/dark regions
- Fresnel: standard fresnel edge glow, brighter on edges facing away from light
- Environment map: HDR loaded via `<Environment preset="night">` from drei, or a custom moody HDR
- Amplitude uniform modulates noise speed (slow when idle, faster when Minji speaks)

**State machine driven by Zustand:**

| State | Noise speed | Scale | Color tint | Notes |
|-------|-------------|-------|------------|-------|
| `idle` | 0.2 | 1.0 | base blue | Slow drift, default landing screen |
| `minji_speaking` | 0.8 + amplitude | 1.0 + amplitude*0.05 | warmer, slight saturation bump | Primary active state |
| `user_listening` | 0.1 | 0.98 | cooler, desaturated | Attentive, waiting |
| `user_speaking` | 0.5 + amplitude | 1.0 + amplitude*0.03 | cooler than Minji | Reactive but clearly a different state |
| `processing` | 0.4 | 1.0 | neutral | Looping pulse while Whisper/judge run |

Transitions between states use `react-spring` or `lerp` on the uniform values with 400-600ms easing so changes feel smooth, not snapped.

**Post-processing:**

Single bloom pass via `@react-three/postprocessing`. Subtle (intensity ~0.4, threshold ~0.8) to get the soft glow around bright surface regions without making it look like a Unity asset.

**Performance budget:**

- Target 60fps on M1 Mac and above
- Canvas sized at 280x280 px, not fullscreen
- Single sphere geometry, 64x64 segments (smooth enough, cheap)
- If performance drops below 30fps on lower-end hardware, a settings toggle falls back to the v1.1 CSS/SVG orb
- "Reduced motion" accessibility preference also triggers the CSS fallback

**Fallback plan:**

If the R3F sphere stalls in development, ship v2 with the v1.1 CSS/SVG orb and bump the R3F sphere to v2.1. The `<Orb>` component API stays the same (props: `state`, `amplitude`), only the implementation changes.

### 5.3.2 Orb themes (v3)

**Concept:** The orb is not just an AI presence indicator, it's a character with moods and environments. Users can select from a library of visual themes that wholly change the sphere's aesthetic while preserving the same state machine (idle / speaking / listening / processing) and audio reactivity. Over time the orb evolves toward a "living AI" — the theme adapts to context like time of day, season, weather, and conversation content.

**v3 scope (user-pick only):** Ship a theme picker in settings. User selects a theme manually. The selected theme persists across sessions. No automatic adaptation yet.

**v4+ scope (living AI, parked for later spec):** Automatic theme selection based on context. Potential inputs:

- **Time of day** — night sky after sunset, clear sky mid-day, warm tones at golden hour
- **Season** — cherry blossom in spring, forest greens in summer, warmer ember tones in autumn, snow in winter
- **User's local weather** — via weather API, orb reflects current conditions
- **Conversation theme** — 카페에서 gets warm daylight, 주말 이야기 gets clear sky, 길 찾기 gets urban tones
- **Conversation sentiment** — analyzed from the session transcript, shifts mood as the conversation evolves
- **Streak or session count** — subtle evolution over long-term use

v4 adaptation logic is explicitly out of scope for v3 and will get its own spec when we reach it.

**v3 theme library (initial four):**

| Theme | Vibe | Primary colors | Motion character | Special layer |
|-------|------|----------------|------------------|---------------|
| `storm` (default) | Moody, contemplative | Deep blues, grays, slate | Drifting shadow and light, medium pace | None |
| `clear_sky` | Bright, optimistic | Sky blue, soft white, warm highlight | Gentle wispy clouds, slow drift | Subtle sun-glow hotspot |
| `night_sky` | Calm, reflective | Deep navy, near-black, cool highlights | Very slow drift, almost still | Particle stars with twinkle |
| `cherry_blossom` | Dreamy, delicate | Pale pink, cream, dusty rose | Soft organic motion, slightly faster | Drifting petal particles |

Fire, forest, ocean, and snow themes are candidates for v3.1 or v4. The initial four cover the full emotional range (moody / bright / calm / delicate) and establish the theme system architecture.

**Architecture: one shader, many configs**

Themes are NOT separate shaders. They are TypeScript configuration objects that drive uniforms on a single unified shader. This is the most important architectural decision in the theme system.

```
src/components/Orb/
├── Orb.tsx
├── OrbSphere.tsx
├── orbShader.ts             # Single unified shader with theme-driven uniforms
├── themes/
│   ├── index.ts              # Theme registry + types
│   ├── storm.ts
│   ├── clearSky.ts
│   ├── nightSky.ts
│   └── cherryBlossom.ts
├── layers/
│   ├── StarParticles.tsx    # Opt-in, used by night_sky
│   └── PetalParticles.tsx   # Opt-in, used by cherry_blossom
└── useOrbTheme.ts           # Subscribes to settings, returns active theme config
```

**Theme config shape:**

```typescript
interface OrbTheme {
  id: string;
  displayName: string;
  koreanName: string;         // For the theme picker UI
  baseColor: string;          // Hex, main sphere color
  accentColor: string;        // Hex, used for highlights / sun / moon
  fresnelColor: string;       // Hex, edge glow
  noiseSpeed: number;         // Idle speed multiplier, 0.1-1.0
  noiseScale: number;         // Spatial frequency
  motionBias: 'omnidirectional' | 'upward' | 'downward' | 'horizontal';
  brightnessMultiplier: number; // 0.5-1.5, overall luminosity
  bloomIntensity: number;     // 0-1
  specialLayer?: 'stars' | 'petals' | null;
}
```

State-specific values (idle / speaking / listening) are applied ON TOP of theme values — the theme sets the aesthetic baseline, the state modulates speed and saturation from there. This ensures all themes respond to the same state machine without per-theme state config.

**Settings UI for theme picker:**

- Accessible via settings gear on landing screen
- Section heading: "Theme" / "테마"
- Grid of 4 preview cards, each showing a small live-rendered orb using that theme
- Selected theme has a subtle ring/outline
- Click to select, applies immediately without requiring save
- Persists in local storage (Electron `safeStorage` or plain config)

**Performance considerations:**

- Theme previews in the picker should use a smaller canvas (120x120) and lower dpr to avoid burning GPU rendering 4 orbs at once
- Special layers (stars, petals) are only mounted when the active theme requires them
- Switching themes should not re-mount the Canvas, only update uniform values and toggle layer mounts

**Out of scope for v3:**

- Adaptive/contextual theme switching (parked for v4 living-AI spec)
- User-created custom themes
- Seasonal auto-rotation
- Weather API integration
- Sentiment-driven theme shifts during a session

---

## 6. Roadmap

### v0.1 — UI shell, no API calls (3-5 days)

Goal: build out the full visual experience with mocked data, so every screen and interaction feels right before a single token is spent on OpenAI. You can demo this version end-to-end without any API keys.

- Electron + React + Vite + TypeScript + Tailwind + Zustand scaffold
- Main/renderer IPC boundary set up
- Landing screen (section 3.1) with all selectors functional (state-wise, not yet session-triggering)
- Settings screen with OpenAI API key input, persisted via `safeStorage`. ElevenLabs field stubbed but labeled "v2, not yet used".
- Session screen (section 3.2) with:
  - Static orb (CSS radial gradient, 3 states toggleable for preview)
  - iMessage-style transcript (section 3.2.1) running off a hardcoded sample conversation that plays on a timer
  - Session timer countdown
  - Per-turn response timer countdown
  - Hint cards rendering (no TTS preview yet, just visual)
  - Fade masks on transcript working correctly
  - Bubble entry animations working
- Recap screen (section 3.8) rendering a hardcoded sample session
- Design tokens from section 5.2 applied consistently
- Mac dev build runs cleanly, `npm run dev` works end to end

At the end of v0.1, the app looks and feels complete. It just isn't actually talking to anyone yet. This is the right moment to show it to someone for visual feedback before you commit to wiring OpenAI.

### v0.2 — OpenAI wiring (1 week)

- Replace mocked Minji turns with real GPT-4o(-mini) calls
- Wire OpenAI TTS for Minji's voice
- Wire Whisper STT for user audio capture
- Wire LLM judge (section 3.7)
- Per-turn timer actually drives the state machine
- English-response branch, stall rescue, valid-response branch all functional
- Transcripts save to SQLite

### v1.0 — MVP (1 week polish on top of v0.2)
- Adaptive difficulty logic (steps up after 4 good turns, manual override working)
- Hint cards with TTS preview on hover
- Session recap with real transcript and vocab list extracted by LLM
- Error recovery: mic permission denied, network loss, API key invalid
- Cost estimate shown in settings, per-session cost shown on recap
- Mac DMG build

### v1.1 — Polish (1 week)
- Romanization toggle on hint cards
- Voice amplitude-reactive orb (CSS/SVG)
- Session history screen
- Basic error recovery (network loss, mic permission denied)
- Windows build

### v2.0 — R3F sphere + deeper practice (2-3 weeks)
- React Three Fiber sphere with animated surface noise, PBR material, environment reflections (section 5.3.1)
- Real-time audio reactivity (TTS output + mic input via Web Audio `AnalyserNode`)
- State-driven color and motion changes (idle, speaking, listening, processing)
- Bloom post-processing for glow
- Settings toggle to fall back to CSS orb on low-end hardware or with reduced-motion preference
- Vocabulary review mode (flashcards from past sessions)
- Multiple voices (ElevenLabs integration), user-selectable persona
- Custom persona names
- Configurable per-turn timer length
- Dark mode

### v3.0 — Orb themes + serious practice (open scope)
- Orb theme system (section 5.3.2) with 4 initial themes: storm, clear sky, night sky, cherry blossom
- Theme picker in settings with live previews
- Star particle layer for night sky theme
- Petal particle layer for cherry blossom theme
- Raw-audio pronunciation scoring (Azure Speech or similar phoneme-level)
- Streaks, daily goals
- Themed conversation packs (travel, business, dating)
- User-defined custom scenarios

### v4.0 — Living AI orb (future, separate spec)
- Automatic theme adaptation based on context: time of day, season, weather, conversation sentiment
- Subtle mood evolution during long sessions
- Optional weather API integration (user-toggleable for privacy)
- Potential iOS companion app (separate project)

---

## 7. Open questions (parked for post-v1)

- Do we need a backend at all, or can everything stay client-side with user-provided keys forever? (Leaning: stay client-side through v2, evaluate for v3 if we add cross-device history.)
- How do we handle multiple Korean dialects? (v1 assumes standard Seoul Korean only.)
- Does the AI ever volunteer grammar explanations, or strictly stay in-character as Minji? (v1: strictly in-character. v3 could add an "explain that last turn" button that breaks the fourth wall.)
- Pricing model if this ever leaves personal-use scope. (Not in scope for v1.)

---

## 8. Known risks

- **Whisper Korean accuracy on short utterances:** Whisper can hallucinate or under-transcribe 1-2 word Korean responses. Mitigation: pass context (Minji's last question) to the judge so it can evaluate semantic fit even when transcription is fuzzy.
- **Pronunciation judge subjectivity:** LLM-as-judge will be inconsistent on borderline pronunciation. Mitigation: bias toward leniency in v1, collect user frustration signal (if we add one), tighten thresholds in v1.1.
- **API cost runaway:** A 10-minute session with heavy TTS could cost real money. Mitigation: local rate limiter, cost estimate shown in settings, session cost shown on recap screen.
- **Mic permissions UX on Mac:** Electron mic permissions are fiddly. Mitigation: dedicated first-run permission flow with clear fallback instructions if denied.

---

## 9. What to build first in Claude Code

Paste this PRD into Claude Code and ask it to scaffold v0.1. The goal of v0.1 is a visually complete UI shell with zero API calls, driven by mocked data. You should be able to demo the whole app feel before wiring OpenAI.

**v0.1 build order:**

1. Electron + Vite + React + TypeScript + Tailwind + Zustand project scaffold
2. Main/renderer IPC boundary set up (even though v0.1 doesn't use it, the plumbing needs to exist)
3. Design tokens from section 5.2 applied globally
4. Landing screen matching section 3.1, all selectors functional locally
5. Settings screen with OpenAI API key input persisted via `safeStorage`. ElevenLabs field stubbed and clearly labeled "v2, not yet used"
6. Orb component (CSS radial gradient, 3 states toggleable for preview)
7. iMessage-style transcript (section 3.2.1) with fade masks, entry animations, auto-scroll, driven by a hardcoded sample conversation that plays on a setInterval
8. Session screen composed from orb + transcript + session timer + per-turn timer + hint cards (all visual, no logic driving them)
9. Recap screen rendering a hardcoded sample session
10. `npm run dev` runs the full Electron app end to end

**Do not in v0.1:** call OpenAI, record real audio, persist real transcripts. That's v0.2.

Once v0.1 feels right visually, iterate to v0.2 by replacing the mocked data sources one at a time (Minji dialogue first, then TTS, then STT, then judge), testing each slice in isolation before wiring them end-to-end. That sequencing means you can always fall back to the last working state if something breaks.
