/**
 * Game.jsx – Root Game Orchestrator
 *
 * Responsibilities:
 * 1. Owns the WebGL canvas (React Three Fiber Canvas)
 * 2. Bridges game state (DOM) ↔ 3D scene (WebGL)
 * 3. Spawns and coordinates all game entities
 * 4. Manages the camera follow system
 * 5. Wires together all game systems
 *
 * Architecture note:
 * The playerRef (a THREE.Vector3 reference) is shared across
 * all 3D components via prop drilling. This avoids React state
 * updates from 3D frame loops, keeping the render cycle clean.
 */

import { memo, useRef, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';

import {
  CRYSTAL_POSITIONS,
  ENEMY_SPAWNS,
  SERVER_NODE_POSITIONS,
  TERMINAL_POSITIONS,
} from './systems/worldLayout';
import { useGameStore, MISSION_STATES } from './systems/useGameStore';
import { useKeys } from './hooks/useKeys';

import Player          from './components/Player/Player';
import Enemy           from './components/Enemy/Enemy';
import Crystal         from './components/Crystal/Crystal';
import ServerNode      from './components/ServerNode/ServerNode';
import Terminal        from './components/Terminal/Terminal';
import Environment     from './components/Environment/Environment';
import HUD             from './components/UI/HUD';
import TerminalOverlay from './components/Terminal/TerminalOverlay';

// ── Camera follow rig ──────────────────────────────────────────────────────────
const CAM_OFFSET = new THREE.Vector3(0, 7, 12.5);
const CAM_FOLLOW_SPEED = 6;
const PLAYER_DAMAGE_COOLDOWN_MS = 900;
const _camTarget = new THREE.Vector3();
const _lookAt    = new THREE.Vector3();

function CameraRig({ playerRef }) {
  const { camera } = useThree();
  useFrame((_, delta) => {
    const p = playerRef.current;
    if (!p) return;
    _camTarget.set(p.x + CAM_OFFSET.x, p.y + CAM_OFFSET.y, p.z + CAM_OFFSET.z);
    camera.position.lerp(_camTarget, 1 - Math.exp(-CAM_FOLLOW_SPEED * delta));
    _lookAt.set(p.x, p.y + 1.15, p.z);
    camera.lookAt(_lookAt);
  });
  return null;
}

// ── Inner 3D scene (inside Canvas context) ────────────────────────────────────
const GameWorld = memo(function GameWorld({
  playerRef,
  keys,
  actions,
  extractionUnlocked,
  missionState,
  terminalOpen,
}) {
  // Threat aggregation across enemies (avoids per-frame store dispatch from each enemy)
  const threatLevels = useRef([0, 0, 0]);
  const publishedThreat = useRef(-1);
  const lastDamageAt = useRef(-Infinity);

  const handleSetThreat = useCallback((idx, level) => {
    threatLevels.current[idx] = level;
    const max = Math.round(Math.max(...threatLevels.current) / 5) * 5;
    if (max !== publishedThreat.current) {
      publishedThreat.current = max;
      actions.setThreat(max);
    }
  }, [actions]);

  const handleDamagePlayer = useCallback((amount) => {
    const now = performance.now();
    if (now - lastDamageAt.current < PLAYER_DAMAGE_COOLDOWN_MS) return;
    lastDamageAt.current = now;
    actions.damagePlayer(amount);
  }, [actions]);

  const handleExtract = useCallback(() => {
    if (extractionUnlocked && missionState === MISSION_STATES.PLAYING) {
      actions.win();
    }
  }, [actions, extractionUnlocked, missionState]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.72} color="#263952" />
      <hemisphereLight args={['#9acbff', '#111a27', 1.15]} />
      <directionalLight
        position={[-6, 12, 8]}
        intensity={2.2}
        color="#d0e8ff"
      />

      {/* Camera */}
      <CameraRig playerRef={playerRef} />

      {/* Procedural environment */}
      <Environment
        extractionUnlocked={extractionUnlocked}
        playerRef={playerRef}
        onExtract={handleExtract}
      />

      {/* Player (Vi3W asset) */}
      <Player playerRef={playerRef} keys={keys} paused={terminalOpen} />

      {/* Enemy drones (Vi3W asset) */}
      {ENEMY_SPAWNS.map((pos, i) => (
        <Enemy
          key={`enemy-${i}`}
          id={i}
          startPosition={pos}
          playerRef={playerRef}
          onDamagePlayer={handleDamagePlayer}
          onSetThreat={(level) => handleSetThreat(i, level)}
        />
      ))}

      {/* Data crystals (procedural) */}
      {CRYSTAL_POSITIONS.map((pos, i) => (
        <Crystal
          key={`crystal-${i}`}
          position={pos}
          playerRef={playerRef}
          onCollect={() => actions.collectCrystal()}
        />
      ))}

      {/* Server nodes (procedural) */}
      {SERVER_NODE_POSITIONS.map((pos, i) => (
        <ServerNode
          key={`node-${i}`}
          id={`node-${i}`}
          position={pos}
          playerRef={playerRef}
          keysRef={keys}
          onNearby={(nearby) =>
            nearby
              ? actions.setContextAction({ label: 'RESTORE SERVER NODE' })
              : actions.clearContextAction()
          }
          onRestore={() => actions.restoreNode()}
        />
      ))}

      {/* AI Terminals (procedural) */}
      {TERMINAL_POSITIONS.map((pos, i) => (
        <Terminal
          key={`terminal-${i}`}
          id={`terminal-${i}`}
          position={pos}
          playerRef={playerRef}
          keysRef={keys}
          onNearby={(nearby) =>
            nearby
              ? actions.setContextAction({ label: 'ACCESS AI TERMINAL' })
              : actions.clearContextAction()
          }
          onOpen={() => actions.openTerminal({})}
        />
      ))}
    </>
  );
});

// ── Root Game component ────────────────────────────────────────────────────────
export default function Game() {
  const { state, actions } = useGameStore();
  const playerRef = useRef(new THREE.Vector3());
  const keys      = useKeys();

  // Timer tick every second
  useEffect(() => {
    if (state.missionState !== MISSION_STATES.PLAYING || state.terminalOpen) return;
    const id = setInterval(() => actions.tickTime(), 1000);
    return () => clearInterval(id);
  }, [state.missionState, state.terminalOpen, actions]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* ── WebGL canvas ────────────────────────────────── */}
      <Canvas
        frameloop={state.terminalOpen ? 'never' : 'always'}
        camera={{ position: [0, 5, 8.5], fov: 58, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        fallback={
          <div className="game-loading" role="alert">
            <span>3D RENDERING UNAVAILABLE</span>
            <span className="game-loading__detail">
              Enable WebGL and hardware acceleration, then reload the mission.
            </span>
          </div>
        }
        style={{ background: '#020810' }}
      >
        <GameWorld
          playerRef={playerRef}
          keys={keys}
          actions={actions}
          extractionUnlocked={state.extractionUnlocked}
          missionState={state.missionState}
          terminalOpen={state.terminalOpen}
        />
        <EffectComposer multisampling={0}>
          <Bloom
            luminanceThreshold={1.35}
            luminanceSmoothing={0.18}
            intensity={0.42}
            mipmapBlur
          />
        </EffectComposer>
        <Preload all />
      </Canvas>

      {/* ── DOM overlay: HUD ─────────────────────────── */}
      <HUD state={state} actions={actions} />

      {/* ── Terminal overlay (WOW feature) ───────────── */}
      {state.terminalOpen && (
        <TerminalOverlay
          gameState={state}
          onClose={actions.closeTerminal}
        />
      )}
    </div>
  );
}
