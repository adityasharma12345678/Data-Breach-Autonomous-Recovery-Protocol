/**
 * Enemy – Corrupted Security Drone
 *
 * Implements a Finite State Machine with three states:
 *   PATROL  → walks a patrol path between waypoints
 *   CHASE   → locks onto player and pursues
 *   RETURN  → walks back to patrol path start
 *
 * State transitions:
 *   PATROL  → CHASE   when player is within DETECT_RANGE
 *   CHASE   → RETURN  when player escapes LOSE_RANGE
 *   RETURN  → PATROL  when back within WAYPOINT_TOLERANCE of home
 *
 * The enemy also damages the player when within ATTACK_RANGE.
 */

import { Suspense, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { prepareEnemyModel } from '../../systems/modelPresentation';
import { useGLTF } from '../../systems/modelLoader';

const DETECT_RANGE     = 9;     // player detection radius
const LOSE_RANGE       = 13;    // player lost radius
const ATTACK_RANGE     = 1.6;   // melee attack radius
const PATROL_SPEED     = 2.5;
const CHASE_SPEED      = 4.5;
const RETURN_SPEED     = 3.0;
const ROTATE_SPEED     = 8;
const ATTACK_INTERVAL  = 1.2;   // seconds between damage ticks
const ATTACK_DAMAGE    = 6;
const TARGET_HEIGHT    = 2.05;
const WAYPOINT_TOL     = 0.5;

// FSM states
const FSM = { PATROL: 'PATROL', CHASE: 'CHASE', RETURN: 'RETURN' };

function EnemyModel() {
  const { scene } = useGLTF('/models/enemy.glb');
  const model = useMemo(() => prepareEnemyModel(scene, TARGET_HEIGHT), [scene]);
  return <primitive object={model} />;
}

function EnemyLoadingVisual() {
  return (
    <group position={[0, 0.95, 0]}>
      <mesh>
        <octahedronGeometry args={[0.62, 1]} />
        <meshStandardMaterial
          color="#8a1528"
          emissive="#f21f3d"
          emissiveIntensity={1.4}
          metalness={0.6}
          roughness={0.36}
        />
      </mesh>
      <mesh position={[0, 0.05, 0.52]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshBasicMaterial color="#ff4057" toneMapped={false} />
      </mesh>
    </group>
  );
}

function buildWaypoints(origin) {
  return [
    new THREE.Vector3(origin.x,      0, origin.z),
    new THREE.Vector3(origin.x + 6,  0, origin.z),
    new THREE.Vector3(origin.x + 6,  0, origin.z + 6),
    new THREE.Vector3(origin.x,      0, origin.z + 6),
  ];
}

export default function Enemy({
  id,
  startPosition = [8, 0, 0],
  playerRef,
  onDamagePlayer,
  onSetThreat,
}) {
  const meshRef     = useRef();
  const [fsmState, setFsmState] = useState(FSM.PATROL);
  const wpIndex     = useRef(0);
  const lastAttack  = useRef(0);
  const waypoints   = useMemo(() => buildWaypoints(new THREE.Vector3(...startPosition)), [startPosition]);
  const targetQuat  = useRef(new THREE.Quaternion());
  const direction   = useRef(new THREE.Vector3());

  useFrame(({ clock }, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const player = playerRef?.current;
    const pos    = mesh.position;

    // ── FSM Transition Logic ──────────────────────────────
    if (player) {
      const dist = pos.distanceTo(player);

      if (fsmState === FSM.PATROL && dist < DETECT_RANGE) {
        setFsmState(FSM.CHASE);
      } else if (fsmState === FSM.CHASE && dist > LOSE_RANGE) {
        setFsmState(FSM.RETURN);
        wpIndex.current = 0;
      }
    }

    // ── FSM Behaviour ─────────────────────────────────────
    let speed    = PATROL_SPEED;
    let target   = null;

    if (fsmState === FSM.PATROL) {
      target = waypoints[wpIndex.current];
      speed  = PATROL_SPEED;

      if (pos.distanceTo(target) < WAYPOINT_TOL) {
        wpIndex.current = (wpIndex.current + 1) % waypoints.length;
      }

    } else if (fsmState === FSM.CHASE && player) {
      target = player;
      speed  = CHASE_SPEED;

      // Attack if close enough
      const dist = pos.distanceTo(player);
      if (dist < ATTACK_RANGE) {
        const now = clock.elapsedTime;
        if (now - lastAttack.current > ATTACK_INTERVAL) {
          lastAttack.current = now;
          onDamagePlayer?.(ATTACK_DAMAGE);
        }
      }

    } else if (fsmState === FSM.RETURN) {
      target = waypoints[0];
      speed  = RETURN_SPEED;

      if (pos.distanceTo(target) < WAYPOINT_TOL) {
        setFsmState(FSM.PATROL);
      }
    }

    // ── Move toward target ─────────────────────────────────
    if (target) {
      const dir = direction.current.subVectors(target, pos);
      dir.y = 0;
      const dist2 = dir.length();

      if (dist2 > 0.05) {
        dir.normalize();
        pos.addScaledVector(dir, speed * delta);

        // Smooth rotation
        const angle = Math.atan2(dir.x, dir.z);
        targetQuat.current.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, angle);
        mesh.quaternion.slerp(targetQuat.current, ROTATE_SPEED * delta);
      }
    }

    pos.y = 0;

    // ── Report threat for HUD ──────────────────────────────
    if (player && onSetThreat) {
      const d = pos.distanceTo(player);
      if (fsmState === FSM.CHASE) {
        onSetThreat(Math.round(Math.max(0, 100 - ((d / DETECT_RANGE) * 60))));
      } else {
        onSetThreat(0);
      }
    }
  });

  return (
    <group ref={meshRef} position={startPosition} data-id={id}>
      <Suspense fallback={<EnemyLoadingVisual />}>
        <EnemyModel />
      </Suspense>
      <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.82, 40]} />
        <meshBasicMaterial color="#ff344d" transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial color="#ff4a59" toneMapped={false} />
      </mesh>
      <pointLight color="#ff233d" intensity={1.6} distance={4.5} position={[0, 1.2, 0]} />
      {/* Alert ring visible during CHASE */}
      <AlertRing fsmState={fsmState} />
    </group>
  );
}

/** Floating alert indicator above the enemy during CHASE state */
function AlertRing({ fsmState }) {
  const ringRef = useRef();

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    const chasing = fsmState === FSM.CHASE;
    ringRef.current.visible = chasing;
    if (chasing) {
      ringRef.current.rotation.z = clock.elapsedTime * 3;
      ringRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 4) * 0.1);
    }
  });

  return (
    <mesh ref={ringRef} position={[0, 2.8, 0]} visible={false}>
      <torusGeometry args={[0.42, 0.055, 8, 24]} />
      <meshStandardMaterial
        color="#ff2d4a"
        emissive="#ff2d4a"
        emissiveIntensity={3}
        transparent
        opacity={0.9}
        toneMapped={false}
      />
    </mesh>
  );
}

useGLTF.preload('/models/enemy.glb');
