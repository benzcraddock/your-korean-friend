# PRD patch — Orb themes (v3 direction)

Park this for v3. Surgical additions only. Leaves all existing PRD content intact.

---

## Change 1: Add new subsection 5.3.2 immediately after 5.3.1

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

## Change 2: Add a new v3 roadmap entry in section 6

**Find the v3.0 entry and replace with:**

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

## That's it

Two surgical changes. Everything else in the PRD stays untouched. The orb theme work is now clearly parked for v3 with a v4 direction sketched but not yet specced. When you reach v3, we'll revisit with implementation details; when you reach v4, we'll do a fresh spec for the adaptive intelligence piece.
