# Screenshot Guide

Capture clean browser screenshots at a consistent desktop resolution (for example 1440 × 900), then capture at least one narrow viewport to show responsive UI. Avoid developer tools, cursor hover states, and transient loading frames unless the screenshot specifically demonstrates startup.

Recommended output directory: `docs/screenshots/`. Use PNG for UI-heavy frames. Captures currently in the repository were made in the shared browser at 579 × 361 pixels; use a larger browser viewport when available for portfolio exports.

| # | Title | Purpose | Location in Game | Suggested Caption | Suggested Filename |
|---:|---|---|---|---|---|
| 1 | Start Screen | Establish the product identity and visual tone. | Initial briefing before launch. | “Autonomous recovery protocol briefing and mission objectives.” | `start-screen.png` |
| 2 | Launch Diagnostics | Show responsive startup feedback. | Immediately after selecting Initiate Recovery Protocol. | “Recovery systems initialize with visible status feedback.” | `launch-sequence.png` |
| 3 | Mission Briefing | Communicate the objective chain. | Start screen with objective list in view. | “Recover five data fragments, restore three nodes, and extract.” | `mission-briefing.png` |
| 4 | Facility Overview | Show environment layout and camera framing. | Early mission, viewed toward the central facility lanes. | “A readable third-person view of the recovery facility.” | `facility-overview.png` |
| 5 | Player Exploration | Feature the player model and HUD together. | Move through the arena before reaching an objective. | “The recovery engineer navigates the compromised facility.” | `player-exploration.png` |
| 6 | Drone Encounter | Make enemy presentation and threat cues obvious. | When a drone is in chase state. | “A corrupted security drone has acquired the recovery unit.” | `drone-encounter.png` |
| 7 | Data Crystal | Highlight collectible geometry and pickup feedback. | Stand near a crystal before collection or capture its pickup effect. | “Procedural data crystals mark recoverable facility data.” | `data-crystal.png` |
| 8 | Server Node Restoration | Show the interaction and restoration objective. | Near a node during the restoration sequence. | “Restoring a server node advances network recovery.” | `node-restoration.png` |
| 9 | Terminal Diagnostics | Feature the diagnostic interface and representative telemetry. | Open an in-world terminal. | “The terminal combines mission-linked status with simulated diagnostics.” | `terminal-diagnostics.png` |
| 10 | Threat Analysis | Show a second terminal view and alert context. | Terminal threat-analysis tab during a drone encounter. | “Threat analysis presents the current mission’s simulated security picture.” | `terminal-threat-analysis.png` |
| 11 | Mission HUD | Demonstrate the gameplay interface hierarchy. | Mid-mission with health, progress, and threat visible. | “Mission progress and threat status remain visible during play.” | `mission-hud.png` |
| 12 | Mission Complete | End on the full product loop. | Win screen after reaching extraction. | “The recovery mission concludes at the extraction zone.” | `mission-complete.png` |

Screenshots 1–11 have captures under `docs/screenshots/`, except screenshot 12: automated playthroughs ended in drone-caused failures before successful extraction, so a Mission Complete image was not captured. For a compact public portfolio, prioritize 1, 4, 6, 8, 9, and 12. Verify that screenshots do not imply that simulated terminal logs are real network telemetry.
