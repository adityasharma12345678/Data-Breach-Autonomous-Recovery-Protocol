# Project Summary

## Data Breach: Autonomous Recovery Protocol

### Problem

A 3D assignment can easily become a collection of visual features without a clear product loop, understandable engineering boundaries, or a strong portfolio narrative.

### Solution

Build a browser-based recovery mission with a clear objective chain, readable feedback, and a documented React/Three.js architecture. The player collects data fragments, restores server infrastructure, survives hostile drones, and reaches extraction.

### Gameplay

Third-person keyboard movement, collision, three patrol/chase/return drones, five collectible data crystals, three interactive server nodes, diagnostic terminals, extraction gating, and win/loss screens.

### Technology

React, Vite, JavaScript, Three.js, React Three Fiber, Drei, and a restrained post-processing pass. The player and enemy are Vi3W-generated GLB models; environment and collectible forms are procedural.

### Architecture

The DOM UI and WebGL scene are separate presentation layers. Refs carry frame-frequency input and spatial values. A Context + reducer store owns mission and interface state. Shared world-layout data supports both rendering and collision resolution.

### Key Achievements

- Shipped a complete, playable mission loop.
- Integrated and normalized generated GLB character assets.
- Implemented reusable entity behavior and a finite-state-machine enemy.
- Added a diagnostic terminal with clear documentation that its telemetry is simulated.
- Added launch progress feedback, local Draco decoding, and technical documentation.

### Portfolio Value

The project shows that interactive 3D work can include product flow, UI, reliable data boundaries, asset handling, and tradeoff documentation—not only scene rendering.

### Interview Value

Strong discussion topics include frame-loop data flow, React/R3F boundaries, FSM behavior, collision tradeoffs, generated-asset normalization, startup feedback, and the distinction between simulated diagnostics and real AI.
