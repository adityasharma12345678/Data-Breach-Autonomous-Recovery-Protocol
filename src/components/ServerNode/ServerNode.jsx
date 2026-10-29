/**
 * ServerNode – Corrupted Network Infrastructure Node
 *
 * Procedural geometry representing a server node in the facility.
 * The player presses E when nearby to begin a restoration sequence.
 *
 * States:
 *   CORRUPTED  → Red / glitching, needs restoration
 *   RESTORING  → Animated progress (takes RESTORE_TIME seconds)
 *   RESTORED   → Green / stable, contributes to mission completion
 *
 * Proximity detection drives the context action prompt on the HUD.
 */

import { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

const INTERACT_RADIUS = 2.5;
const RESTORE_TIME    = 3.5;   // seconds

const NODE_STATES = { CORRUPTED: 'CORRUPTED', RESTORING: 'RESTORING', RESTORED: 'RESTORED' };

export default function ServerNode({
  position = [0, 0, 0],
  playerRef,
  onNearby,
  onRestore,
  keysRef,
  id,
}) {
  const groupRef    = useRef();
  const coreRef     = useRef();
  const ringRef     = useRef();
  const groundRingRef = useRef();
  const progressRef = useRef(0);
  const [nodeState, setNodeState] = useState(NODE_STATES.CORRUPTED);
  const stateRef    = useRef(NODE_STATES.CORRUPTED);
  const nearbyRef   = useRef(false);
  const eWasDown    = useRef(false);

  const setNodeStateBoth = useCallback((s) => {
    stateRef.current = s;
    setNodeState(s);
  }, []);

  const colorMap = {
    [NODE_STATES.CORRUPTED]: '#ff2d4a',
    [NODE_STATES.RESTORING]: '#ff8c00',
    [NODE_STATES.RESTORED]:  '#00ff9d',
  };

  useFrame(({ clock }, delta) => {
    const player = playerRef?.current;
    const group  = groupRef.current;
    if (!group) return;

    const dist = player
      ? Math.sqrt(
          (player.x - position[0]) ** 2 +
          (player.z - (position[2] ?? 0)) ** 2
        )
      : Infinity;

    const nearby = dist < INTERACT_RADIUS;

    if (nearby !== nearbyRef.current) {
      nearbyRef.current = nearby;
      if (stateRef.current !== NODE_STATES.RESTORED) {
        onNearby?.(nearby, id);
      } else {
        onNearby?.(false, id);
      }
    }

    // ── Core animation ─────────────────────────────────────
    const t = clock.elapsedTime;
    if (coreRef.current) {
      if (stateRef.current === NODE_STATES.CORRUPTED) {
        // Glitch flicker
        const glitch = Math.sin(t * 17) > 0.7;
        coreRef.current.scale.setScalar(glitch ? 0.9 : 1.0);
        coreRef.current.rotation.y += 0.03;
      } else if (stateRef.current === NODE_STATES.RESTORING) {
        coreRef.current.rotation.y += 0.08;
        coreRef.current.scale.setScalar(1 + Math.sin(t * 6) * 0.05);
      } else {
        coreRef.current.rotation.y += 0.01;
        coreRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.02);
      }
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = t * (stateRef.current === NODE_STATES.RESTORING ? 4 : 1);
    }
    if (groundRingRef.current) {
      groundRingRef.current.material.opacity =
        stateRef.current === NODE_STATES.CORRUPTED
          ? 0.22 + (Math.sin(t * 3) + 1) * 0.08
          : stateRef.current === NODE_STATES.RESTORING
            ? 0.55
            : 0.2;
      groundRingRef.current.scale.setScalar(
        stateRef.current === NODE_STATES.RESTORING ? 1 + Math.sin(t * 8) * 0.08 : 1,
      );
    }

    // ── Restoration sequence ───────────────────────────────
    if (stateRef.current === NODE_STATES.RESTORING) {
      progressRef.current += delta;
      if (progressRef.current >= RESTORE_TIME) {
        setNodeStateBoth(NODE_STATES.RESTORED);
        onNearby?.(false, id);
        onRestore?.(id);
      }
    }

    // ── E key interaction ──────────────────────────────────
    const eDown = keysRef?.current?.['KeyE'] ?? false;

    if (nearby && eDown && !eWasDown.current && stateRef.current === NODE_STATES.CORRUPTED) {
      eWasDown.current = true;
      setNodeStateBoth(NODE_STATES.RESTORING);
      progressRef.current = 0;
    }

    if (!eDown) eWasDown.current = false;
  });

  const col = colorMap[nodeState];

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={groundRingRef}
        position={[0, 0.045, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.95, 1.28, 48]} />
        <meshBasicMaterial
          color={col}
          transparent
          opacity={0.28}
          side={2}
          toneMapped={false}
        />
      </mesh>
      {/* Base platform */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[0.8, 1.0, 0.2, 16]} />
        <meshStandardMaterial
          color="#0a1628"
          emissive={col}
          emissiveIntensity={0.15}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Server tower body */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <boxGeometry args={[0.8, 1.6, 0.5]} />
        <meshStandardMaterial
          color="#111e30"
          metalness={0.9}
          roughness={0.2}
          emissive={col}
          emissiveIntensity={0.08}
        />
      </mesh>

      {/* Core sphere */}
      <mesh ref={coreRef} position={[0, 1.6, 0.3]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial
          color={col}
          emissive={col}
          emissiveIntensity={3}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Rotating ring */}
      <mesh ref={ringRef} position={[0, 1.6, 0.3]}>
        <torusGeometry args={[0.35, 0.03, 8, 32]} />
        <meshStandardMaterial
          color={col}
          emissive={col}
          emissiveIntensity={2}
        />
      </mesh>

      {/* Point light */}
      <pointLight color={col} intensity={nodeState === NODE_STATES.RESTORED ? 1.8 : 1.2} distance={4.5} position={[0, 1.6, 0]} />

      {/* Status label */}
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.26}
        color={col}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {nodeState === NODE_STATES.CORRUPTED
          ? 'NODE: CORRUPTED'
          : nodeState === NODE_STATES.RESTORING
          ? 'RESTORING...'
          : 'NODE: RESTORED'}
      </Text>
    </group>
  );
}
