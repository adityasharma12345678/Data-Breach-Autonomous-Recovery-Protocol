# Development Notes

Engineering notes for understanding the project's development, implementation choices, known issues, and possible interview discussion.

## Planning Process

The initial brief was reduced to a small end-to-end loop: start, traverse, collect, restore, survive, and extract. The implementation was then organized around the things needed to support that loop:

1. A player controller and shared world coordinates.
2. Entity systems for threats, collectibles, nodes, and terminals.
3. Mission state and DOM-based feedback.
4. Model-loading and presentation safeguards.
5. Launch, camera, visibility, and documentation polish.

The design uses refs for per-frame values and reducer actions for discrete events. That boundary was chosen before adding more UI so that movement would not cause high-frequency React updates.

## Iterations

- **Core scene and controls:** added the R3F canvas, player model, movement, and camera follow.
- **Mission entities:** added drone behavior, crystals, server nodes, terminals, extraction, and mission state.
- **Interface:** built briefing, HUD, notifications, terminal overlay, and end screens.
- **Reliability:** aligned rendering and collision data through shared layout constants, cleaned up effect timers, and paused gameplay while the terminal is open.
- **Asset presentation:** normalized generated model bounds, cloned materials for role-specific styling, and added loading stand-ins.
- **Launch and camera polish:** lazy-loaded gameplay behind an animated sequence; removed overhead structures and raised the camera to improve battlefield awareness.
- **Packaging:** bundled Draco decoder assets locally and documented the asset and runtime pipeline.

## Engineering Challenges

### Generated model scale and origin

GLB export dimensions cannot be assumed. The loader path measures model bounds, scales to a target height, and grounds the model. Character materials are cloned before tuning so presentation changes do not mutate a cached source material.

### Multiple instances of one drone model

Each drone needs an independent transform. The loaded GLB scene graph is cloned for the instances while geometry resources can be shared.

### High-frequency scene state

Movement and threat checks run in the animation loop. Storing every frame's values in React state would create unnecessary re-renders. Refs carry player position and keys; the game store receives discrete events and quantized threat updates.

### Camera visibility

Decorative roof and ceiling pieces could sit between the camera and objectives. They were removed rather than implementing a more complex fading system. The camera offset is elevated, and perimeter geometry is kept low.

### Launch latency perception

The gameplay module loads dynamically. The launch screen now shows staged diagnostics immediately and has an explicit error/retry path instead of appearing unresponsive during initialization.

### Canvas context consistency

A reported `Hooks can only be used within the Canvas component` error led to checking the R3F runtime and dependency optimization. Vite dependency deduplication for React, React DOM, R3F, and Three.js resolved the reproduced duplicate-context issue in the tested setup.

## Tradeoffs

- A fixed arena and simple collision shapes were favored over a general physics engine.
- A small FSM was favored over behavior trees or navigation systems.
- Simulated diagnostics keep the terminal self-contained, but are not actual AI analysis or real network telemetry.
- Procedural geometry supports rapid iteration, but has less authored detail than dedicated environment models.
- Local Draco decoder files increase public asset size but remove the runtime dependency on a remote decoder host.
- Bloom adds visual emphasis and rendering cost; it is restrained and remains a profiling target.

## Visual Improvements

- Raised the follow camera for improved tactical awareness.
- Removed overhead ceiling/beam structures that obstructed the view.
- Reduced the height of boundary walls and toned down floor grid contrast.
- Used cloned player/enemy material styling and faction colors to distinguish protagonist from threats.
- Added animated, emissive objective and threat cues while keeping environment contrast controlled.
- Added staged launch diagnostics and local model-decoder assets.

## Performance Optimizations

- Keyboard input and player transforms use refs.
- Threat values are aggregated and quantized before store updates.
- Gameplay is lazy-loaded after launch.
- Repeated model geometry and textures are reused where practical; scene instances are cloned for independent transforms.
- Static environment and collision data are bounded and share one layout source.
- No physics solver or shadow-map pass is used.
- Draco decoders load from the local public directory.

The production build has previously emitted a warning that the minified gameplay chunk exceeds Vite's default size threshold. The build remains functional, but profiling and further code splitting are worthwhile follow-up work.

## Bug Fixes and Reliability

- Shared world-layout constants prevent rendered obstacles and collision checks from drifting apart.
- Suspense stand-ins keep the scene visible while character assets load.
- Terminal opening pauses the game loop and elapsed-time updates.
- A shared damage cooldown avoids simultaneous drone hits stacking into one instant.
- Launch initialization shows feedback and a retry path rather than a blank wait.
- The R3F dependency deduplication configuration addressed a duplicate Canvas-context failure in the reproduced local setup.

## Lessons Learned

1. Keep render-loop data out of React state unless it must drive declarative UI.
2. Centralize positions used by both rendering and collision.
3. Treat model bounds, origin, material reuse, and decoder availability as runtime integration concerns.
4. Prioritize readable gameplay lines over architectural decoration.
5. Show immediate progress during asynchronous startup and make failure recoverable.
6. Distinguish simulated presentation from real telemetry in both the interface and documentation.

## Future Improvements

- Add unit tests for reducer transitions and collision boundaries.
- Profile the gameplay bundle and split where it meaningfully improves load behavior.
- Validate keyboard focus, reduced-motion behavior, and assistive-technology semantics.
- Add optional sound and mobile controls.
- Add further level layouts only after the current gameplay and performance are well tested.
- Replace simulated terminal data only if a real data integration is a deliberate product requirement.
