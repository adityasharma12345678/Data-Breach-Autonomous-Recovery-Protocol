# Engineering Decisions

This document records why the project uses its current tools and patterns, including the tradeoffs they introduce.

## Why React?

React provides a common component and lifecycle model for the landing screen, HUD, terminal, end screens, and R3F scene. It makes the division between browser UI and 3D entities visible in the code and supports small, composable components. React is used where declarative reconciliation helps; rapidly changing transforms are not modeled as React state.

## Why React Three Fiber?

React Three Fiber (R3F) expresses a Three.js scene as components and provides the `useFrame` hook for render-loop work. This enables entity components to own their visual and spatial behavior without manually wiring a separate imperative scene graph.

The abstraction has overhead and requires respecting the Canvas context for R3F hooks. That cost is reasonable for this project and enables a cohesive React implementation.

## Why Three.js?

Three.js is the underlying WebGL rendering library used by R3F. It supplies the scene graph, materials, geometry, camera, and vectors required by the game. Direct access is retained for operations such as bounding-box normalization, vector math, and smooth transforms.

## Why not Unity?

The deliverable is a browser-based assignment built around the required JavaScript stack. React, Vite, and Three.js allow the game to run as a web application with a conventional DOM interface and straightforward static hosting. Unity would introduce a different runtime and deployment pipeline without improving the core objective of demonstrating browser engineering.

## Why procedural collectibles and environment assets?

Procedural geometry avoids a separate asset dependency for repeated, relatively simple world elements. It makes size, color, and layout quick to iterate and keeps assets aligned with the game's visual system. The choice is intentional; organic primary characters use dedicated GLB models.

## Why mission-based gameplay?

A short objective chain gives the prototype a readable start, middle, and finish: collect data, restore infrastructure, then extract. The goal is more meaningful than an open-ended movement demo while keeping the scope small enough to finish and communicate clearly.

## Why a cyber/AI recovery theme?

The theme connects the facility environment, data collection, server restoration, enemy corruption cues, and the diagnostic interface into one coherent product premise. It also makes system status and data visualization natural parts of the player's experience.

## Why Vi3W assets?

The assignment called for generated 3D models. The player and enemy are the primary gameplay entities, so the two generated GLB assets are used directly in gameplay. Procedural geometry is reserved for collectibles and environmental components.

## Why a finite state machine for drones?

The drone behavior has three discrete modes: patrol, chase, and return. A finite state machine keeps transitions explicit and easy to debug. More complex behavior trees or pathfinding would add machinery without matching the current arena's needs.

## Why the current architecture?

The implementation separates concerns by update frequency and presentation type:

- Refs hold input and spatial data that changes every frame.
- A reducer handles discrete mission and UI state transitions.
- Entity components own local spatial behavior and visuals.
- Shared systems centralize world coordinates, collision rules, and model normalization.
- DOM UI and WebGL rendering remain separate, but exchange data through callbacks and the store.

This keeps the project comprehensible without introducing a larger game-engine abstraction.

## Why Context + `useReducer`?

The game has a modest set of shared state and discrete actions. Context + reducer is built into React, keeps transitions explicit, and avoids adding a state library. Its tradeoff is that all consumers of the context can re-render when the value changes; frame-frequency state is deliberately kept outside that store.

## Why ref-based input and movement?

Keyboard state is read every frame. Storing it in React state would schedule UI reconciliation on input changes without adding value. A mutable ref lets the player system sample current keys when needed; delta time makes movement speed independent of frame rate.

## Why not a physics engine?

The level is a small, fixed, flat arena with a limited set of static obstacles. Purpose-built bounds and shape collision are sufficient for blocking movement; proximity checks cover pickups and interaction. A physics engine would increase bundle and integration cost without supporting a necessary mechanic here.

## Why simulated terminal data?

The terminal is a themed interface and gameplay feedback surface, not a claim of a live AI or facility backend. Some metrics reflect game state and the remaining system readouts are simulated. This keeps the project self-contained and avoids network services, credentials, or misleading external dependencies.

## Why a staged launch sequence?

Gameplay is dynamically imported. Staged status messages provide immediate feedback while that work completes and present a recoverable error path if initialization fails. It improves perceived responsiveness without pretending that arbitrary load progress is measured.

## Why local Draco assets?

The GLB models use Draco compression. Serving the decoder locally avoids relying on a third-party decoder URL at runtime and makes the asset pipeline more reproducible. The decoder's included license remains with the redistributed files.

## Why restrained post-processing?

A thresholded bloom pass supports objective readability while avoiding full-screen glow. Geometry, silhouette, motion, and color remain the primary visual cues. Post-processing is kept limited because visual effects should not compromise frame time or legibility.
