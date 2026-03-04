# The Halls of Polymathica — Corridor Redesign

## Overview

Replace the cylindrical ring layout with a museum-style architecture: a grand rotunda hub with four themed wings, each containing corridors that fly the camera through a polymath's intellectual biography before arriving at their alcove.

The core experience: when you click a polymath, the camera doesn't just slide — it flies down a corridor where their accomplishments, thinking patterns, quotes, workflow phases, and identity are plastered on the walls. The journey IS the experience.

## Wing Structure

Four wings grouped by cognitive mechanism (categorized by Da Vinci agent):

### Wing I — Hall of Reduction
*"Remove until the structure speaks for itself."*

| # | Polymath | Core Mechanism |
|---|---------|----------------|
| 1 | Feynman | Demolishes inherited complexity to expose first principles |
| 2 | Carmack | Finds the binding constraint before touching anything else |
| 3 | Shannon | Strips noise from signal; finds the invariant beneath all variation |
| 4 | Rams | Removes until only necessity remains |
| 5 | Musk | Physics as a hard ceiling; question every requirement, delete before building |
| 6 | Linus | Taste as a gate; structural ugliness is evidence of conceptual confusion |

### Wing II — Hall of Structural Vision
*"Build the complete model before you touch the world."*

| # | Polymath | Core Mechanism |
|---|---------|----------------|
| 7 | Tesla | Runs complete mental simulation until the machine exists fully in his mind |
| 8 | Da Vinci | Observes mechanism, then finds it in a completely different domain |
| 9 | Lovelace | Recognizes abstract operational pattern; instantiates it on a new substrate |
| 10 | Tao | Maps the entire solution landscape; finds multiple routes before choosing one |
| 11 | Munger | Holds a lattice of models; reads convergence as signal |
| 12 | Gates | Decomposes any domain to atoms; models before investing or committing |

### Wing III — Hall of Inversion
*"Find freedom by first accepting what cannot be changed."*

| # | Polymath | Core Mechanism |
|---|---------|----------------|
| 13 | Bezos | Works backward from customer outcome; the press release before the product |
| 14 | Sun Tzu | Wins before fighting by knowing terrain before the opponent does |
| 15 | Thiel | Finds the secret by questioning the premise, not accepting the consensus |
| 16 | Disney | Lets the Dreamer run without constraint, then accepts the Critic's constraints fully |
| 17 | Andreessen | Reads discontinuities as proof the old map is now wrong |
| 18 | Aurelius | Divides what is in his control from what is not; acts only on the former |

### Wing IV — Hall of Resonance
*"Signal is not real until it has landed in a receiver."*

| # | Polymath | Core Mechanism |
|---|---------|----------------|
| 19 | Jobs | Holds technical possibility and human feeling in tension; chooses the feeling |
| 20 | Van Gogh | Engineers visual structure to produce specific feeling in the viewer |
| 21 | Ogilvy | Researches the receiver's actual inner life before constructing any message |
| 22 | Godin | Finds the smallest audience whose existing worldview already fits the offer |
| 23 | MrBeast | Maps attention decay curves; engineers structure to prevent collapse |
| 24 | Graham | Writes to think; the essay as a diagnostic instrument for transmissible clarity |
| 25 | Socrates | Exposes what the interlocutor doesn't know by demanding they define what they claim to know |

### Cross-Wing Adjacencies
Wings should be positioned so these pairs are physically proximate:
- Shannon (Reduction) ↔ Lovelace (Vision) — both operate on information as abstract substrate
- Carmack (Reduction) ↔ Tesla (Vision) — both simulate systems to find constraints
- Thiel (Inversion) ↔ Feynman (Reduction) — both start by questioning the premise

## Spatial Architecture

### The Grand Rotunda (Hub)

A circular room in the holographic TRON aesthetic. Camera starts at center.

- **Radius:** ~15 units
- **Floor:** Circular plane, dark with holographic grid lines
- **Dome:** Hemisphere overhead, transparent dark glass with faint hexagonal wireframe
- **Archways:** 4 tall rectangular portal openings at 90-degree intervals (N/E/S/W)
- **Each archway has:** Wing name in HoloText above, tagline below, subtle color tint, generated art asset as backdrop texture
- **Inside each archway:** 6-7 polymath portraits as a small clickable gallery wall

Archway layout (top-down):
```
              REDUCTION (North)
                  |
                  |
VISION (East) ----+---- INVERSION (West)
                  |
                  |
              RESONANCE (South)
```

### Corridors (Generated On Demand)

When clicking a polymath portrait, a corridor materializes from the archway toward the polymath's alcove at the far end. Only one corridor exists in the scene at a time.

- **Length:** ~40 units
- **Width:** ~4 units (intimate)
- **Height:** ~5 units
- **Walls:** Two PlaneGeometry walls with HoloGlassPanels mounted on them
- **Floor:** Grid lines tinted in the polymath's accent color
- **Ceiling:** Open to void or faint wireframe trusses

#### Wall Panel Layout (10 panels, 5 per side)

```
ARCHWAY                                                    ALCOVE
  |  [Name/Title] [Kernel]  [Phase1-2] [Phase3-4] [Quotes]  |
  |  LEFT          RIGHT     LEFT       RIGHT      LEFT   [PORTRAIT]
  |  [Identity]  [Traits]  [Workflow]  [Output]  [Gates]  [TERMINAL]
  |  RIGHT        LEFT      RIGHT      LEFT       RIGHT     |
```

| Panel | Content Source (from agent .md) | Wall |
|-------|-------------------------------|------|
| 1 | Name + Title + Era (frontmatter) | Left |
| 2 | The Kernel (one-sentence essence quote) | Right |
| 3 | Identity Traits (7-8 bullet points) | Left |
| 4 | Phases 1-2 of Mandatory Workflow | Right |
| 5 | Phases 3-4 of Mandatory Workflow | Left |
| 6 | Workflow Diagram (visual flowchart) | Right |
| 7 | Output Format (response template) | Left |
| 8 | Decision Gates (hard stops) | Right |
| 9 | Key Quotes (memorable lines) | Left |
| 10 | Future: Video/Media (placeholder) | Right |

#### Progressive Reveal

- Panels materialize in sequence as camera approaches (front-to-back)
- Reveal: edge glow inward (0.3s) → text fades in with typewriter sweep (0.2s)
- Panel stays lit permanently once revealed
- On the way BACK: all panels already lit, no re-animation
- Trigger: camera z-position passes panel z-position within threshold

#### Corridor Lifecycle

- **Click polymath:** Corridor meshes created, panels begin materializing, camera transitions to spline start
- **Exit to wing (ESC):** Panels fade out in reverse order (fast ~0.5s total), then removed from scene
- **Click different polymath (same wing):** Old corridor fades while new one builds (crossfade)

## Camera System

### Navigation Depth Stack

```
Rotunda → Wing → Corridor → Alcove
  ESC ←    ESC ←    ESC ←     ESC ←
```

| Depth | Camera Position | Looking At | OrbitControls |
|-------|----------------|------------|---------------|
| `rotunda` | Center [0, 1.5, 0] | Forward | Enabled — free orbit |
| `wing` | ~8 units toward archway | Into archway, gallery visible | Enabled — limited orbit |
| `corridor` | On spline path | Forward down corridor | **Disabled** — cinematic flight |
| `alcove` | Corridor end, facing portrait | Polymath portrait + terminal | Enabled — slight orbit |

### Spline Flight

Camera follows a CatmullRomCurve3 through the corridor:

```
P0 (archway) ──── P1 ──────────────────── P2 ──── P3 (alcove)
  fast accel        cruise (constant)        decelerate
  (ease-in)                                  (ease-out)
```

- Normalized `t` parameter (0→1) sampled along spline
- `t` advances per frame: `delta / corridorFlightDuration`
- Easing: smoothstep for cinematic feel
- Camera lookAt: slightly ahead on spline (t + 0.05) for natural forward gaze
- **Flight duration:** Configurable 3-20 seconds (stored in settings, exposed as HUD slider, default 5s)

### Two Camera Controllers

- `CameraController` — handles lerp/slerp transitions (rotunda↔wing, arrival at alcove). Uses proven precomputed-quaternion pattern.
- `SplineCameraController` — takes over exclusively during corridor flight. Checks `depth === 'corridor'` and yields otherwise.

### Transition Sequences

**Rotunda → Wing:** Smooth lerp toward archway (existing CameraController pattern)

**Wing → Corridor:**
1. Corridor panels begin materializing
2. Camera lerps to spline start point (~0.5s)
3. Spline flight begins, `t` advances each frame
4. Panels reveal as camera passes them

**Corridor → Alcove:** Spline reaches t=1, camera settles at alcove position, OrbitControls re-enabled with `update()` sync

**ESC during corridor:** Camera decelerates and reverses back to wing view

## Data Pipeline

### Agent File Parser

Main process reads all 25 agent `.md` files on startup, parses them into `CorridorContent` objects, caches in memory.

```typescript
interface CorridorContent {
  name: string
  description: string
  color: string
  kernel: string
  identityTraits: string[]
  phases: Phase[]
  outputFormat: string
  decisionGates: string[]
  keyQuotes: string[]
}

interface Phase {
  name: string
  description: string
}
```

### Parsing Strategy

Agent files share consistent structure with `##` section headers:
1. YAML frontmatter → `name`, `description`, `color`
2. `## The Kernel` → blockquote → `kernel`
3. `## Identity` → bullet list → `identityTraits[]`
4. `## Mandatory Workflow` → split on `### Phase N:` → `phases[]`
5. `## Output Format` → raw text → `outputFormat`
6. `## Decision Gates` → bullets → `decisionGates[]`
7. All blockquotes → `keyQuotes[]`

### IPC

- Parsed on startup in main process
- `api.getCorridorContent(polymathId)` → returns cached `CorridorContent`
- No re-parsing per click

### Future Media

Panel 10 reserved for video/rich media. `CorridorContent` can later include a `media` field for generated video URLs, images, or interactive elements stored in DB per polymath.

## Component Architecture

### File Structure

```
src/renderer/features/spatial/
├── components/
│   ├── Rotunda.tsx                # NEW — dome, floor, 4 archways
│   ├── Archway.tsx                # NEW — single wing entrance portal
│   ├── WingGallery.tsx            # NEW — polymath portraits inside archway
│   ├── Corridor.tsx               # NEW — flythrough corridor container
│   ├── CorridorPanel.tsx          # NEW — single wall panel with content
│   ├── CorridorFloor.tsx          # NEW — grid floor tinted per polymath
│   ├── SplineCameraController.tsx # NEW — spline flight during corridor
│   ├── CameraController.tsx       # MODIFIED — rotunda/wing/alcove lerps
│   ├── HallLayout.tsx             # REWRITTEN → RotundaLayout.tsx
│   ├── Alcove.tsx                 # KEPT — endpoint of each corridor
│   ├── EntranceCard.tsx           # REMOVED — replaced by rotunda inscription
│   ├── HoloGlassPanel.tsx         # KEPT — reused for corridor panels
│   ├── HoloText.tsx               # KEPT — reused everywhere
│   ├── PolymathPortrait.tsx       # KEPT — wing gallery + alcove
│   └── ScanlineOverlay.tsx        # KEPT
├── constants/
│   ├── layout.ts                  # REWRITTEN — rotunda geometry, corridor dims
│   └── wings.ts                   # NEW — wing definitions, polymath groupings
├── store/
│   └── hallStore.ts               # MODIFIED — 4-depth enum, corridor state
├── hooks/
│   ├── useCorridorContent.ts      # NEW — fetches parsed content via IPC
│   └── useSplineFlight.ts         # NEW — CatmullRom spline, t param, easing
└── utils/
    └── agentParser.ts             # NEW — main process, .md → CorridorContent

src/main/
└── services/
    └── agentContentService.ts     # NEW — parses + caches all 25 agent files
```

### Scene Graph

```jsx
<Canvas>
  <Rotunda>
    <RotundaFloor />
    <RotundaDome />
    <Archway wing="reduction"  position={NORTH} />
    <Archway wing="vision"     position={EAST} />
    <Archway wing="inversion"  position={SOUTH} />
    <Archway wing="resonance"  position={WEST} />
      └── <WingGallery>
            <PolymathPortrait /> x 6-7
          </WingGallery>
  </Rotunda>

  {activeCorridor && (
    <Corridor polymathId={id}>
      <CorridorFloor color={polymath.color} />
      <CorridorPanel side="left"  index={0..4} content={...} />
      <CorridorPanel side="right" index={0..4} content={...} />
    </Corridor>
  )}

  {atAlcove && <Alcove ... />}

  <CameraController />
  <SplineCameraController />
  <ParticleField />
  <ScanlineOverlay />
  <EffectComposer>...</EffectComposer>
</Canvas>
```

### Store State

```typescript
type NavigationDepth = 'rotunda' | 'wing' | 'corridor' | 'alcove'
type WingId = 'reduction' | 'vision' | 'inversion' | 'resonance'

interface HallState {
  depth: NavigationDepth
  activeWing: WingId | null
  activePolymathId: string | null
  corridorProgress: number              // 0-1 spline t
  corridorFlightDuration: number        // 3-20s setting

  cameraTarget: Vector3Tuple
  cameraLookAt: Vector3Tuple

  // Actions
  navigateToWing(wingId: WingId): void
  navigateToPolymath(polymathId: string): void
  navigateToRotunda(): void
  exitCorridor(): void
  setCorridorProgress(t: number): void
}
```

## Assets

- `assets/imgs/reduction-archway.png` — Wing I portal art
- `assets/imgs/vision-archway.png` — Wing II portal art
- `assets/imgs/inversion-archway.png` — Wing III portal art
- `assets/imgs/resonance-archway.png` — Wing IV portal art

## Verification Plan

1. `pnpm run typecheck` — zero errors
2. `pnpm run build` — clean build
3. Manual testing:
   - App opens to rotunda center, dome + floor + 4 archways visible
   - Click archway → camera smoothly moves to wing, portraits visible
   - Click polymath → corridor materializes, camera flies through
   - Wall panels reveal progressively as camera passes
   - Camera arrives at alcove, OrbitControls re-enabled
   - ESC from alcove → back to corridor end → wing → rotunda
   - Flight duration slider works (3-20s range)
   - Content on walls matches agent file data
   - No camera snaps or jerks at any transition point
