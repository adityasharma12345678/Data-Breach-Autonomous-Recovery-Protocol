# Architecture

This document describes the current implementation of **Data Breach: Autonomous Recovery Protocol**. It is intended as a codebase orientation guide, not a proposal for a larger engine.

## Project Structure

```text
src/
├── App.jsx                         # app-level store, screen routing, launch sequence
├── Game.jsx                        # Canvas, camera, entity composition, game/UI bridge
├── main.jsx                        # React DOM entry point
├── index.css                       # global design tokens, HUD and screen styles
├── components/
│   ├── Crystal/Crystal.jsx          # floating collectible and collection feedback
│   ├── Enemy/Enemy.jsx              # drone model and patrol/chase/return FSM
│   ├── Environment/Environment.jsx  # procedural facility and extraction zone
│   ├── Player/Player.jsx            # player model, input, movement, collision
│   ├── ServerNode/ServerNode.jsx    # interactive restoration sequence
│   ├── Terminal/
│   │   ├── Terminal.jsx             # in-world terminal interaction
│   │   └── TerminalOverlay.jsx      # DOM diagnostics overlay
│   └── UI/HUD.jsx                   # mission HUD and context feedback
├── hooks/useKeys.js                 # keyboard state in a ref
├── pages/
│   ├── EndScreens.jsx               # win/loss presentations
│   └── LandingPage.jsx              # mission briefing and launch action
└── systems/
    ├── collisions.js                # arena bounds and obstacle resolution
    ├── modelLoader.js               # GLTF loading and local Draco decoder path
    ├── modelPresentation.js         # per-instance model scaling/material setup
    ├── useGameStore.jsx             # reducer, context, actions, mission state
    └── worldLayout.js               # shared positions and arena constants

public/
├── models/player.glb
├── models/enemy.glb
└── draco/                           # local Draco decoder files and license
```

## Component Hierarchy

```text
main.jsx
└── App
    └── GameStoreProvider
        ├── LandingPage / launch sequence
        ├── Game (lazy-loaded)
        │   ├── Canvas
        │   │   ├── CameraRig
        │   │   ├── Environment
        │   │   ├── Player
        │   │   ├── Enemy × 3
        │   │   ├── Crystal × 5
        │   │   ├── ServerNode × 3
        │   │   ├── Terminal × 3
        │   │   └── EffectComposer
        │   ├── HUD (DOM)
        │   └── TerminalOverlay (DOM, conditional)
        └── EndScreens
```

`App` owns top-level mission presentation and keeps the game store alive while the active screen changes. `Game` composes the scene and bridges store actions into focused entity components. The 3D scene uses React Three Fiber; conventional React DOM is used for the HUD, terminal, briefing, and end screens.

## Rendering Flow

1. The landing screen is shown immediately.
2. On launch, `App` displays staged diagnostic feedback and dynamically imports the game module.
3. `Game` creates the R3F `Canvas` and renders the world and mission entities.
4. `useFrame` callbacks update transforms and evaluate spatial behaviors.
5. Entity callbacks dispatch discrete events to the game store.
6. DOM components react to store updates; the canvas does not depend on per-frame React state updates.

The canvas uses ambient, hemisphere, and directional light, plus a thresholded bloom pass. Roof/ceiling geometry is omitted to preserve camera visibility. The terminal pauses the canvas render loop while open.

## State Flow

`src/systems/useGameStore.jsx` provides a React Context + `useReducer` store. It owns mission phase, health, score, objective counts, elapsed time, threat telemetry, extraction eligibility, notifications, and terminal state.

```text
Keyboard / spatial condition
          ↓
Entity useFrame or DOM interaction
          ↓ callback
Game.jsx action handler
          ↓ dispatch
Reducer transition
          ↓
HUD / screen / terminal re-render
```

The reducer is the authority for objective counts and mission outcomes. Transforms, key states, animation clocks, and other frame-rate values stay in refs. This separation prevents movement from producing a React render on every animation frame.

## Mission System

Mission phases are `IDLE`, `PLAYING`, `WIN`, and `LOSE`. The player must collect five crystals and restore three nodes. Once both conditions are met, extraction becomes available; reaching the extraction zone dispatches the win action. Health reaching zero transitions to loss.

Progress is derived from the objective counts and extraction availability rather than incremented independently. Collecting and restoring update score and show a notification. `START_MISSION` and `RESTART` initialize a fresh mission state.

## Player System

`Player.jsx` reads key state from `useKeys` and integrates motion in `useFrame` using delta time. Diagonal input is normalized, movement is speed-limited after a long frame, and the shared collision resolver applies arena bounds and obstacle collision. The player rotates toward the current movement vector.

The player's `THREE.Vector3` position is exposed by ref to the camera, enemies, crystals, nodes, and terminals. This is the scene's high-frequency spatial data path.

## Enemy AI System

Each enemy instance uses a finite state machine:

```text
PATROL -- player enters detect range --> CHASE
CHASE  -- player leaves lose range ----> RETURN
RETURN -- enemy reaches home waypoint -> PATROL
```

Patrol waypoints are derived from the enemy's spawn. Distinct detection and loss radii provide hysteresis and reduce rapid state switching. Enemies move and rotate in the frame loop; visible state changes update React state for the chase indicator. Nearby drones apply periodic damage, while `Game.jsx` applies a shared cooldown to prevent simultaneous hits from stacking.

## Interaction System

Crystals are collected by proximity. Server nodes and terminals report when the player is near and use an edge-triggered `E` press to begin restoration or open the terminal. Context actions and notifications are surfaced in the HUD through store actions.

The same player-position ref is read by each spatial interaction, avoiding a separate polling layer. `worldLayout.js` holds the corresponding spawn and prop coordinates.

## Terminal System

`Terminal.jsx` is a 3D kiosk that detects proximity and interaction. `TerminalOverlay.jsx` is a DOM interface with a boot sequence, diagnostics, threat view, corruption visualization, and a simulated event feed. Some displayed values are derived from game state; other metrics and log entries are illustrative generated data, not telemetry from a real network or AI service.

Opening the terminal pauses the canvas and mission timer; `Esc` or the close control resumes play.

## Camera System

`CameraRig` follows the player using a world-space offset `(0, 7, 12.5)`, exponential interpolation, a 58-degree field of view, and a look target above the player's ground position. The elevated third-person view favors awareness of objectives and drones. Ceiling geometry is intentionally absent so facility decoration does not block the camera's view.

## Asset Pipeline

- `public/models/player.glb` and `public/models/enemy.glb` are loaded with Drei's GLTF loader wrapper.
- `modelLoader.js` directs Draco decoding to the local `public/draco/` assets.
- `modelPresentation.js` normalizes model scale from bounds, grounds the model, clones materials, and applies per-role presentation without modifying cached source materials.
- Enemy instances clone the loaded scene graph so each drone can move independently while sharing underlying geometry resources.
- Collectibles and facility props use procedural geometry for iteration speed and a consistent visual language.

## Performance Considerations

- Refs hold keyboard state and frame-frequency transforms.
- Entity callbacks dispatch discrete events rather than dispatching from every frame.
- Threat telemetry is aggregated and quantized before store updates.
- The game module is lazy-loaded after launch and displays a diagnostic progress sequence while loading.
- Static world coordinates are centralized; the arena contains a bounded number of entities.
- No general-purpose physics engine or shadow-map pass is used for this fixed, flat level.
- Draco decoder assets are local, avoiding an external runtime dependency for model decoding.
- The production build currently warns about a large gameplay chunk; further code splitting and profiling are appropriate future work.
