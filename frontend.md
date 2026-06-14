# 🧠 NeuroPuzzle — Frontend Implementation Strategy

> A roadmap for building a modern, visually jaw‑dropping neural network puzzle game that combines education, competition, and stunning UI.

---

## Table of Contents

1. [Introduction & Goals](#introduction--goals)
2. [Technology Stack](#technology-stack)
3. [Design System & Theming](#design-system--theming)
4. [Component Architecture & File Structure](#component-architecture--file-structure)
5. [Screen‑by‑Screen Detailed UI/UX](#screen-by-screen-detailed-uiux)
   - [Global Layout & Navigation](#global-layout--navigation)
   - [Main Menu](#main-menu)
   - [Campaign Map / Level Select](#campaign-map--level-select)
   - [Network Builder (Level Editor)](#network-builder-level-editor)
   - [Training Monitor](#training-monitor)
   - [Results Screen](#results-screen)
   - [Sandbox Mode](#sandbox-mode)
   - [Daily Challenge](#daily-challenge)
   - [Leaderboard](#leaderboard)
   - [Profile & Achievements](#profile--achievements)
   - [Settings & Customization](#settings--customization)
   - [Custom Puzzle Builder](#custom-puzzle-builder)
   - [Multiplayer Lobby (Future)](#multiplayer-lobby-future)
6. [Micro‑interactions & Animation Playbook](#micro-interactions--animation-playbook)
7. [Data Visualization & Micro‑charts](#data-visualization--micro-charts)
8. [State Management Blueprint](#state-management-blueprint)
9. [Performance & Rendering Strategy](#performance--rendering-strategy)
10. [Accessibility & Responsiveness](#accessibility--responsiveness)
11. [Global Theming & Unlockable Cosmetics](#global-theming--unlockable-cosmetics)
12. [Asset & Audio Integration](#asset--audio-integration)
13. [Future‑Proofing & Multiplayer Integration](#future-proofing--multiplayer-integration)
14. [Implementation Checklist (Frontend Only)](#implementation-checklist-frontend-only)

---

## Introduction & Goals

**NeuroPuzzle** must deliver a premium, game‑like experience directly in the browser. The frontend is the heart of the product – it must feel responsive, immersive, and incredibly beautiful. Every interaction should feel tactile, every data point visualised elegantly, and the educational content must be seamlessly woven into the gameplay.

We aim for:
- A **cyberpunk‑meets‑neuroscience** aesthetic that immediately sets the tone.
- Real‑time 3D network visualisation that reacts to training.
- Micro‑charts and live metrics that turn abstract ML concepts into intuitive visuals.
- Smooth, purposeful animations that guide the user without distracting.
- A modular architecture that allows rapid addition of new game modes and features.

---

## Technology Stack

| Category               | Technology                                       | Justification |
|------------------------|--------------------------------------------------|---------------|
| **Framework**          | React 19 + TypeScript                            | Component model, strict typing, large ecosystem. |
| **Build Tool**         | Vite                                             | Blazing‑fast HMR, lightning builds. |
| **3D Rendering**       | Three.js + React Three Fiber (R3F) + Drei        | Best‑in‑class 3D visualisation for the web, declarative API. |
| **Animation**          | Framer Motion + GSAP (for complex timelines)     | Declarative animations for UI, imperative for heavy sequences. |
| **Charts / DataViz**   | Recharts (main) + D3‑scale (custom micro‑charts) | Recharts for large interactive charts; D3 for tiny custom sparklines. |
| **Styling**            | Tailwind CSS + Radix UI primitives + CVA         | Utility‑first styling, accessible unstyled components, variant management. |
| **State Management**   | Zustand + Immer middleware                       | Simpler than Redux, performant, excellent for game state slices. |
| **Routing**            | React Router v6 (with nested layouts)            | Declarative routing, perfect for game screens. |
| **ML Engine (browser)**| TensorFlow.js                                    | Already chosen, we will display its internal tensors in visualisations. |
| **Drag & Drop**        | @dnd‑kit/core + custom Three.js integration (for 3D) | Modern, accessible, highly performant. |
| **Notifications**      | Sonner (toast library)                           | Lightweight, beautiful toast notifications. |
| **Icons**              | Lucide React                                     | Clean, consistent icon set. |
| **Audio**              | Howler.js (wrapped in a React hook)              | For sound effects and background music. |
| **Linting / Format**   | Biome (or ESLint + Prettier)                     | Fast, modern tooling. |

---

## Design System & Theming

### Color Palette (CSS Custom Properties)
```css
:root {
  --bg-app: #0A0E27;
  --bg-panel: #111633;
  --bg-elevated: #1A2040;
  --border-subtle: #2A2F55;
  --neural-blue: #00D9FF;
  --neural-purple: #B800FF;
  --neural-green: #00FF88;
  --neural-red: #FF0055;
  --neural-yellow: #FFD700;
  --text-primary: #EAECF5;
  --text-secondary: #8B8FA8;
  --text-dim: #555977;
}
```
The default **Dark‑Neon** theme is the baseline. Unlockable themes (Ocean, Forest, Synthwave, etc.) are applied by swapping these custom properties at `:root` level. All component styling uses `var(--...)` to respect the current theme.

### Typography
- **Headings**: Inter (or Space Grotesk) – clean, futuristic.
- **Body**: Inter (or DM Sans) – highly readable.
- **Monospace**: JetBrains Mono – for code‑like data, neuron IDs, tensor shapes.
- Sizing via Tailwind’s `text-*` with responsive breakpoints.

### Spacing & Layout
- 8‑point grid system.
- Generous white (dark) space for breathing room.
- Glass‑morphism panels: `backdrop-blur-md bg-opacity-20 border border-white/10 rounded-2xl`.
- Consistent border‑radius tokens: `rounded-lg` for cards, `rounded-xl` for modals, `rounded-full` for pills.

### Component Library
We’ll use **Radix UI** primitives (Dialog, Tooltip, Tabs, Popover, etc.) styled with Tailwind and CVA to create our own futuristic design system. This gives full control over look and feel.

---

## Component Architecture and File Structure

A feature‑based folder structure inside `src/`:

```
src/
├── assets/             # Static images, lottie files, fonts
├── components/
│   ├── ui/             # Primitives: Button, Card, Badge, Tooltip, etc.
│   ├── layout/         # AppShell, Sidebar, TopBar, TabBar
│   ├── network/        # React Three Fiber components (Node, Connection, LayerGroup)
│   ├── charts/         # Recharts wrappers, custom Sparkline, HeatmapCell
│   ├── editor/         # Drag‑drop layer panel, node config popover
│   ├── training/       # LossChart, EpochSlider, NeuronActivityDensity
│   └── game/           # AchievementBadge, StarRating, LevelCard
├── screens/            # Page‑level components (MainMenu, LevelSelect, Editor, etc.)
├── stores/             # Zustand stores (useGameStore, useNetworkStore, useUIStore)
├── hooks/              # Custom hooks (useTrainingLoop, useTheme, useAudio)
├── lib/                # Utilities, constants, types
├── styles/             # Global CSS with theme variables, keyframe animations
└── App.tsx
```

**Core 3D Rendering** lives inside `components/network/` and is orchestrated by a `<NetworkCanvas>` that takes network state and renders it using R3F. This canvas is reused across Editor, Training Monitor, Sandbox.

---

## Screen‑by‑Screen Detailed UI/UX

### Global Layout & Navigation

- **Top‑level tab bar**: Campaign · Sandbox · Daily · Leaderboard · Profile (Settings inside Profile).
- The tab bar is fixed at the bottom on mobile, top on desktop, with neon‑glow underlines on the active tab.
- A **global background**: a slowly‑moving particle field representing a neural network that adapts to the current screen context (e.g., more active during training).
- Persistent audio controls (volume, mute) and a theme quick‑toggle in a small floating corner panel.

### Main Menu

```
┌────────────────────────────────────────────────────┐
│                  ⚡ NEUROPUZZLE ⚡                   │
│           "Design. Train. Optimize."                │
│                                                    │
│    ┌──────────────────────────────────────┐        │
│    │          [START CAMPAIGN]            │  glowing│
│    └──────────────────────────────────────┘        │
│    ┌──────────────────┐ ┌──────────────────┐       │
│    │   SANDBOX MODE   │ │ DAILY CHALLENGE  │       │
│    └──────────────────┘ └──────────────────┘       │
│    ┌──────────────────┐ ┌──────────────────┐       │
│    │   LEADERBOARD    │ │   SETTINGS       │       │
│    └──────────────────┘ └──────────────────┘       │
│                                                    │
│   Background: full‑screen 3D network with           │
│   gentle bobbing nodes and flowing connections      │
└────────────────────────────────────────────────────┘
```
- **Micro‑interactions**: Buttons scale on hover with a soft neon shadow pulse. Background nodes briefly brighten and send a ripple when hovered.
- Top‑right: small user avatar with XP bar (subtle, not dominant).

### Campaign Map / Level Select

A visual “world map” of Acts and Levels, not just a grid.

- **Act tabs**: “Act I: Foundations”, “Act II: Specialization”, “Act III: Mastery”.
- Each **level** represented as a circular node on a branching path (like a skill tree). Completed levels glow green, current level pulses gold, locked levels are dimmed with a lock icon.
- **Level preview panel** (on hover): shows puzzle summary, difficulty stars, best accuracy sparkline (a tiny micro‑chart of past attempts).
- **Filter/Sort**: “Show only 3‑star levels”, “Hardest first”.
- **Progress bar** at the top: Overall Campaign completion with segmented colored sections for each Act.

### Network Builder (Level Editor)

The core of the game – needs to be intuitive yet powerful.

**Layout**:
- **Left Sidebar (collapsible)**: Layer Palette & Node Panel.
  - *Add Layer* button with a dropdown of layer types (Dense, Conv2D, Dropout…).
  - Each added layer appears as a card: layer name, neuron count, activation badge, mini‑histogram of weight distribution. Drag to reorder layers.
  - Click a neuron within a layer to open a **Neuron Inspector** popover: shows incoming weights, bias, activation value, gradient flow.
- **Center Canvas (Three.js)**: The 3D network graph.
  - Layers arranged front‑to‑back (Input → Hidden → Output).
  - Neurons are glowing spheres with size proportional to activation magnitude, color from blue (inactive) to purple (active) to green (correct prediction) or red (error) during testing.
  - Connections are semi‑transparent lines with animated particle flow; thickness = |weight|, color = weight sign.
  - **Drag**: grab a neuron and drag to create a connection (if allowed). Right‑click to delete connection.
  - **Orbit controls**: rotate, pan, zoom. Double‑click a layer to focus on it.
  - Toolbar at the top of canvas: Undo/Redo, Reset View, Toggle Auto‑Arrange, Toggle Connection Opacity.
- **Right Sidebar**: Dataset & Configuration.
  - Tabbed: “Input Data” | “Output Labels” | “Level Info”.
  - Input data visualised as mini‑grids (for images) or 2D scatter plots (for coordinates), with class colors.
  - Stats: Number of samples, features, classes.
- **Bottom Action Bar**:
  - `[TRAIN]` big glowing button.
  - `[TEST]` (disabled until model trained).
  - `[RESET]`, `[EXPORT]`, `[SUBMIT]`.
  - A live **Network Complexity Indicator**: a gauge showing number of parameters and a “parameter budget” bar (turns red if over level limit).

### Training Monitor

When the user hits TRAIN, a full‑screen overlay or animated transition slides in.

**Split View**:
- **Left (60%)**: Live 3D network view.
  - Connections pulse with data flow, weights update color/width smoothly.
  - Neurons glow brighter as they “fire”.
  - A subtle background grid represents the loss landscape morphing.
- **Right (40%)**: Metrics Dashboard.
  - Top: Epoch progress bar (animated ticks, current epoch / total).
  - **Main Loss Chart**: Recharts line chart with gradient fill, real‑time updates every epoch. Hover shows exact loss value. A secondary line for validation loss if available.
  - **Accuracy Gauge**: semi‑circular speedometer indicating current accuracy percentage; needle moves with smoothing.
  - **Learning Rate Control**: a sleek slider with precision increments, visually linked to loss chart (moving it shows a brief prediction shadow).
  - Mini heatmap of the last layer’s weight matrix, updating slowly.
  - **Neuron Activity Sparkline**: a small multi‑series sparkline showing firing frequency of output neurons over the last N epochs.
- **Controls**: `[PAUSE]`, `[STOP]`, `[ADVANCE ONE EPOCH]` (if paused). Early stopping indicator if validation loss plateaus.

Transitions: The editor morphs into the monitor – the canvas zooms out slightly while the dashboard slides in from right with a blur.

### Results Screen

After training and testing, a celebratory overlay.

- **Star rating** (1‑3) based on accuracy vs threshold, speed, and network size.
- **Big animated stats**: Final Accuracy, Loss, F1 Score, Precision, Recall – each number counts up from 0 with a rolling animation.
- **Confusion Matrix** (miniature): a heatmap grid, clicking a cell shows sample that was misclassified.
- **Comparison Chart**: a horizontal bar comparing your network’s parameter count to the optimal and to the average player’s.
- **Rewards panel**: XP earned, any unlocked cosmetics (theme swatch, node skin) with a dazzling unlock effect.
- Actions: `[NEXT LEVEL]` (with a countdown if 3‑star), `[RETRY]`, `[VIEW LEADERBOARD]`.

### Sandbox Mode

A free‑form playground for experimentation.

**Layout**:
- Main area: Network Editor (same as level editor but no puzzle constraints).
- **Bottom dock**: tabs “Datasets”, “Templates”, “History”.
- **Dataset tab**: browse pre‑loaded datasets (MNIST, Iris, custom CSV upload). Drag a dataset onto the canvas to load.
- **Templates tab**: pre‑built architectures (AlexNet‑lite, Simple RNN) that users can drop in.
- **History tab**: list of previously trained models with mini performance sparklines, click to reload.
- No level objectives; instead a floating “Stats” panel that dynamically updates when you test.
- Export option to save the TensorFlow.js model as a downloadable file.

### Daily Challenge

Similar to Campaign level, but with a timed element and special rules.

**Screen**:
- Top banner: challenge title, countdown timer (digital flip‑clock style), and day streak indicator.
- Central editor (condensed version, no left/right sidebars – use popovers and floating panels to save space).
- After completion, a leaderboard for that day’s challenge appears immediately, showing your rank and friend comparisons.
- Micro‑reward for participation even if not top.

### Leaderboard

Global and friends ranking.

**Tabs**: “All Time”, “This Week”, “Daily Challenge”, “Efficiency King”.
- **Leaderboard entries**: stylish cards with rank, avatar, username, score, and a small bar showing their top‑level star distribution.
- Your own entry is highlighted and stuck to the bottom/top with a glowing outline.
- Search bar to find specific players.
- Filter: by region or friends only.

### Profile & Achievements

**Layout**:
- Left: Avatar, username, level, XP progress to next level, join date.
- Main: **Achievement showcase** – grid of achievement badges (locked are dark silhouettes, unlocked are full color with a subtle glow). Click opens details and progress bar.
- **Stats panel**: total levels completed, total training time, average accuracy, networks built, favorite activation function, etc. Displayed as beautiful stat cards with icons and sparklines where appropriate (e.g., “Accuracy Over Time” micro‑chart).
- **Collection**: show unlocked themes, node skins, connection styles. Set active ones.

### Settings & Customization

- Audio: master volume, SFX, music, mute when unfocused.
- Graphics: quality presets (Low/High/Ultra for particle count, shadows).
- Controls: key rebinding for common actions (train, pause, etc.).
- Account: link/unlink, data export, delete.
- Theme selector: visual swatches for each unlockable theme, with a preview panel.

### Custom Puzzle Builder

A specialized editor for the community.

**Interface**:
- Upload CSV / draw data on a 2D canvas.
- Define input/output shapes.
- Set level difficulty, hint text, optimal network constraints.
- Preview mode to test the puzzle before publishing.
- Once published, a shareable link and community rating appear.

### Multiplayer Lobby (Future)

When integrated, a separate tab “Multiplayer” with:
- Lobby list of open races.
- Create room with puzzle selection, time limit, player slots.
- In‑race screen: split view showing each player’s network progress (mini‑network view + progress bars) in real‑time.
- Spectator mode.

---

## Micro‑interactions & Animation Playbook

All animations should be **purposeful** and use Framer Motion’s layout animations, AnimatePresence, and variants.

| Interaction | Effect |
|------------|--------|
| **Button hover** | Scale 1.03, box‑shadow neon glow expands, subtle background brightness shift. |
| **Button press** | Scale 0.97, quick ease‑out. |
| **New layer added** | Layer card slides in from top with a spring, nodes appear with staggered pop‑in. |
| **Neuron activation** | Pulse glow (duration 400ms), scale oscillates between 1 and 1.2. |
| **Data flow (connection)** | Particle stream moving from source to target, speed proportional to absolute weight. |
| **Training epoch tick** | Loss chart point animates in, a brief “ping” ripple emanates from the current value. |
| **Model converged** | Entire network briefly flashes white then settles to green hue, accompanied by gentle particles. |
| **Error / wrong prediction** | Red flash, slight camera shake, an X mark briefly appears on the offending neuron. |
| **Achievement unlocked** | A full‑screen overlay with confetti (using canvas‑confetti lib), badge scales from 0 to 1 with elastic ease. |
| **Tab switch** | Content crossfades or slides (direction based on tab order). |
| **Modal / dialog** | Scales from 95% to 100% with a backdrop blur fade. |
| **Page transitions** | A “neural dissolve” effect: the scene briefly fragments into particles and reforms (only for major route changes, not for tabs). |
| **Tooltip** | Appears with a short expand animation, arrow points to element. |
| **Loading states** | Skeleton screens with shimmer gradient; 3D canvas shows a spinning wire‑frame brain. |

**Sound Design Cues** (integrated via Howler):
- UI: soft click, hover whoosh.
- Training: rhythmic pulsing synth that increases in intensity as loss decreases.
- Success: uplifting chime.
- Error: low buzz.
- Achievement: orchestral sting.

---

## Data Visualization & Micro‑charts

**Design Principle**: Data is not just displayed; it tells a story. Use progressive disclosure – show a sparkline at a glance, expand to full chart on tap/hover.

### Chart Types and Usage

| Visualization | Where Used | Details |
|---------------|------------|---------|
| **Training Loss Curve** (line chart) | Training Monitor, Results | Gradient fill under line, interactive crosshair, callout for minimum loss. |
| **Accuracy Gauge** (donut/speedometer) | Training Monitor, Level Select (mini) | Animated needle, color gradient from red to green. |
| **Validation vs Train Loss** (dual line) | Training Monitor (advanced toggle) | Dashed line for validation, solid for train. |
| **Weight Matrix Heatmap** | Neuron Inspector, Training Monitor (mini) | Small grid (e.g., 8x8) representing first hidden layer’s weights; color intensity from blue (negative) to red (positive). |
| **Activation Distribution** (histogram) | Per‑layer stats in Training Monitor | Live updating bars showing how many neurons are in which activation range. |
| **Confusion Matrix** | Results screen, Sandbox | Color‑coded grid, cell tooltip shows count and percentage, clicking a cell opens sample image popup. |
| **Performance Sparkline** | Level Select (each level), Profile (accuracy over time) | Tiny line (no axes) showing last 5 attempts’ accuracy, colored green if improving, red if not. |
| **Network Complexity Gauge** | Editor bottom bar | Horizontal bar with segments, fill color changes from green to yellow to red as it approaches max allowed params. |
| **Epoch Progress Ring** | Training Monitor header | Circular progress ring around the epoch number, with a pulse on completion. |
| **Leaderboard Ranking Bar** | Leaderboard | Small stacked bar showing distribution of star ratings for that player. |
| **Resource Utilization** (FPS, memory) | Dev panel (hidden by default) | Tiny line graphs for debugging, accessible with a key combo. |

**Custom Micro‑chart Components**: We’ll build a `<Sparkline>` component using SVG that accepts an array of numbers and renders a smooth curve with gradient fill. It will be used extensively. Similarly, `<MiniHeatmap>` and `<GaugeArc>`.

**Real‑time Updates**: During training, charts update efficiently via requestAnimationFrame‑throttled state pushes from the training loop.

---

## State Management Blueprint

Using Zustand with separate slices merged into one store (or multiple stores if performance requires).

### Store Slices

**`useGameStore`**
- `player`: { id, username, xp, level, unlockedThemes[], equippedCosmetics }
- `progress`: map of levelId → { completed, bestAccuracy, stars, attempts }
- `currentLevelId`
- `currentScreen` (for global navigation state)
- `dailyChallenge`: { date, completed, score, rank }
- `achievements`: list of achieved IDs with timestamps

**`useNetworkStore`**
- `layers`: array of layer definitions (type, neuronCount, activation)
- `connections`: adjacency data (from neuronId to neuronId)
- `weights` & `biases`: extracted from TF.js model (or synced)
- `trainingState`: { isTraining, epoch, loss, accuracy, valLoss, paused, ... }
- `selectedNeuronId` (for inspector)
- `undoStack` / `redoStack`

**`useUIStore`**
- `theme`: current theme name
- `sidebarOpen`, `rightPanelOpen`
- `activeModal`: null or string id
- `toasts`: array of notifications
- `preferences`: { soundEnabled, musicVolume, sfxVolume, graphicsQuality }

**`useMultiplayerStore`** (future): room state, player states, sync.

All stores use the `immer` middleware for easy immutable updates. The training loop will be a custom hook `useTrainingLoop()` that reads from `useNetworkStore` and updates it in a web worker or via `requestAnimationFrame` for smooth UI.

---

## Performance & Rendering Strategy

- **3D Canvas**: Rendered off‑screen when not needed (using `frameloop="demand"` in R3F when not animating).
- **Particle effects**: Use GPU‑based shaders via Three.js Points, with a maximum particle budget that scales with `graphicsQuality`.
- **React components**: Memoize heavy lists (leaderboard, layer panels) with `React.memo` and stable keys.
- **Charts**: Recharts can handle real‑time updates up to ~60fps if we batch state updates. We’ll use `useMemo` to only re‑render the chart area when data changes.
- **Code splitting**: Lazy load Sandbox, Multiplayer, and Custom Builder screens using `React.lazy`.
- **Asset loading**: Show a stunning loading screen with a pulsing neuron and loading progress bar while TF.js and models initialise.
- **Web Worker**: Move the actual TensorFlow.js training logic to a Web Worker to keep the main thread free for animations. The worker sends messages to update the store.

---

## Accessibility & Responsiveness

- **Keyboard navigation**: All interactive elements are reachable via Tab. Canvas actions have keyboard shortcuts (e.g., `L` to add layer, `Delete` to remove selected neuron/connection). Document shortcuts in a help modal.
- **Screen readers**: 3D canvas can’t be accessed directly, so we provide a “Text Mode” toggle that renders a simplified 2D representation (list of layers, connections). Provide `aria-labels` for all controls.
- **Responsive breakpoints**:
  - **Desktop (≥1280px)**: Full three‑column editor layout.
  - **Tablet (≥768px)**: Two‑column layout, sidebars become drawers.
  - **Mobile (<768px)**: Single column, canvas simplifies to a 2D top‑down view (or we postpone full mobile support, but basic level play works with vertical scrolling editor).
- **Color contrast**: Ensure all text meets WCAG AA over the dark background. The neon colors are accents; text uses high‑contrast off‑white.

---

## Global Theming & Unlockable Cosmetics

Themes are defined as sets of CSS custom properties stored in a JSON configuration. When a theme is unlocked, it becomes available in Settings. Switching applies a class to `<html>` (e.g., `theme-ocean`) which overrides the variables.

**List of Launch Themes**:
- Dark Neon (default)
- Cyberpunk Sunrise (orange/pink)
- Ocean Depths (blue/teal)
- Forest Canopy (green/gold)
- Synthwave (purple/magenta)

**Node Skins**: Choose from different 3D geometries/shading for neurons: Sphere (default), Crystal (icosahedron), Fire (distorted sphere with emissive glow). Implemented via a shader material swap.

**Connection Styles**: Line, Bezier (curved), ParticleStream, Wave (sine‑wave displacement). A dropdown in Settings.

**Particle Effects**: Background presets like Stars, Matrix Rain, Brain Cells. All are shader‑based.

The store holds `equippedCosmetics` which the UI components read to apply the selected style.

---

## Asset & Audio Integration

- **Images**: Very few; use SVGs for icons, procedural textures for particles.
- **Fonts**: Self‑hosted Inter, Space Grotesk, JetBrains Mono for speed.
- **Audio**: Use small, compressed `.mp3`/`.ogg` files for SFX and music tracks. Implement a `useAudio` hook that respects the store preferences. Music tracks can crossfade between menu and training using Howler’s fade.
- **Lottie/TGS**: For complex achievement animations, we may use Lottie files (lightweight vector animations). But most animations will be done procedurally with Framer Motion and Three.js.

---

## Future‑Proofing & Multiplayer Integration

- **WebSocket context**: Wrap the app with a `<MultiplayerContext>` that connects only when the user enters multiplayer screens. The context provides `sendAction` and receives updates to the local store.
- **Backend sync**: User progress can be synced to a server. Use `zustand`’s `persist` middleware with a custom storage that also pushes to API.
- **Versioning**: The frontend will be deployed independently; feature flags can gate unfinished modes.

---

## Implementation Checklist (Frontend Only)

### Foundation
- [ ] Initialize Vite + React + TypeScript project with dependencies.
- [ ] Configure Tailwind, PostCSS, add custom theme variables.
- [ ] Set up Zustand stores with slices and persistence.
- [ ] Create reusable UI primitives (Button, Card, Badge, etc.) styled with CVA.
- [ ] Implement global layout (TabBar, AppShell) and routing.
- [ ] Build loading screen with neuron animation.

### 3D Engine
- [ ] Set up `<NetworkCanvas>` with R3F, ambient lights, orbit controls.
- [ ] Build `<NeuronSphere>` component: dynamic scale, color, glow.
- [ ] Build `<ConnectionLine>` with animated particle flow.
- [ ] Implement layer‑based auto‑layout algorithm.
- [ ] Add drag‑and‑drop for node placement/connection drawing.
- [ ] Integrate with `useNetworkStore` to render live architecture.

### Core Game Screens
- [ ] Main Menu with animated background.
- [ ] Campaign Map with tree‑style level nodes and sparklines.
- [ ] Network Editor (three‑column layout, all sidebars, inspector).
- [ ] Training Monitor overlay with real‑time charts and 3D feedback.
- [ ] Results Screen with star rating, counting stats, confusion matrix.
- [ ] Sandbox Mode (reuse editor, add dataset/template tabs).
- [ ] Daily Challenge screen with timer and mini‑leaderboard.
- [ ] Leaderboard with tabs and filtering.
- [ ] Profile & Achievements showcase.
- [ ] Settings with theme picker and audio controls.
- [ ] Custom Puzzle Builder.

### Data Visualization Components
- [ ] Create `<Sparkline>` SVG component.
- [ ] Implement `<GaugeArc>` (speedometer).
- [ ] Build `<MiniHeatmap>` grid.
- [ ] Integrate Recharts for loss curves, histogram, etc.
- [ ] Add interactive tooltips (custom, futuristic style).

### Micro‑interactions & Effects
- [ ] Apply Framer Motion to all button, card, modal animations.
- [ ] Implement particle effects on success/achievement.
- [ ] Add canvas post‑processing (bloom, glow) using `@react-three/postprocessing`.
- [ ] Camera shake on error.
- [ ] Animate epoch progress ring.

### Audio
- [ ] Set up Howler.js and create `useAudio` hook.
- [ ] Add UI click, hover, training loop, achievement sounds.
- [ ] Implement music player with crossfade.

### Polish & Performance
- [ ] Lazy load heavy routes.
- [ ] Memo‑ize expensive components.
- [ ] Implement graphics quality settings.
- [ ] Add keyboard shortcuts and accessibility text representation.
- [ ] Conduct performance profiling and optimize particle count.

### Testing & QA
- [ ] Ensure responsive layout adjustments for tablet.
- [ ] Test with screen readers.
- [ ] Verify state persistence across sessions.
- [ ] Check training loop performance without Web Worker first, then offload.

---

*This document is a living blueprint. Every visual detail and interaction should be crafted to delight, educate, and immerse the player in the world of neural networks. Aim for the stars, then ship it!*
