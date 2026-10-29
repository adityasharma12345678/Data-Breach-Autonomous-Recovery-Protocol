/**
 * Player – Futuristic AI Recovery Engineer
 *
 * Loads the player.glb Vi3W asset and handles:
 * - WASD keyboard movement (frame-independent via delta time)
 * - Smooth rotation toward movement direction
 * - Boundary clamping
 * - Collision proximity reporting (via ref)
 * - Camera follow target exposure
 *
 * The component auto-detects model scale on first render
 * and normalises it to a target world height.
 */

import { Suspense, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { resolvePlayerMovement } from '../../systems/collisions';
import { preparePlayerModel } from '../../systems/modelPresentation';
import { useGLTF } from '../../systems/modelLoader';

const SPEED        = 6;          // units/sec
const ROTATE_SPEED = 10;         // rad/sec lerp factor
const TARGET_HEIGHT = 2.05;      // normalised world height for the model

function PlayerModel() {
  const { scene } = useGLTF('/models/player.glb');
  const model = useMemo(() => preparePlayerModel(scene, TARGET_HEIGHT), [scene]);
  return <primitive object={model} />;
}

function PlayerLoadingVisual() {
  return (
    <group position={[0, 0.95, 0]}>
      <mesh>
        <capsuleGeometry args={[0.32, 0.78, 4, 8]} />
        <meshStandardMaterial
          color="#327c91"
          emissive="#1c667e"
          emissiveIntensity={1.1}
          metalness={0.45}
          roughness={0.42}
        />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.24, 12, 12]} />
        <meshStandardMaterial
          color="#8cecff"
          emissive="#38dfff"
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export default function Player({ playerRef, cameraTargetRef, keys, paused = false }) {
  const meshRef   = useRef();

  // Direction vector reused across frames (avoids GC)
  const dir = useRef(new THREE.Vector3());
  const targetQuat = useRef(new THREE.Quaternion());

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    if (paused) {
      if (playerRef) playerRef.current = mesh.position;
      if (cameraTargetRef) cameraTargetRef.current = mesh.position;
      return;
    }

    // ── Movement ───────────────────────────────────────────
    const k = keys.current;
    let dx = 0;
    let dz = 0;

    if (k['KeyW'] || k['ArrowUp'])    dz -= 1;
    if (k['KeyS'] || k['ArrowDown'])  dz += 1;
    if (k['KeyA'] || k['ArrowLeft'])  dx -= 1;
    if (k['KeyD'] || k['ArrowRight']) dx += 1;

    if (dx !== 0 || dz !== 0) {
      dir.current.set(dx, 0, dz).normalize();
      const step = Math.min(delta, 0.05) * SPEED;
      resolvePlayerMovement(
        mesh.position,
        dir.current.x * step,
        dir.current.z * step,
      );

      // Smooth rotation toward movement direction
      const angle = Math.atan2(dir.current.x, dir.current.z);
      targetQuat.current.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, angle);
      mesh.quaternion.slerp(targetQuat.current, ROTATE_SPEED * delta);
    }

    mesh.position.y = 0;

    // ── Expose position for other systems ─────────────────
    if (playerRef)       playerRef.current       = mesh.position;
    if (cameraTargetRef) cameraTargetRef.current = mesh.position;
  });

  return (
    <group ref={meshRef} position={[0, 0, 0]} rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.58, 40]} />
        <meshBasicMaterial
          color="#59e5ff"
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight color="#73dfff" intensity={1.2} distance={4.5} position={[0, 1.3, 0]} />
      <Suspense fallback={<PlayerLoadingVisual />}>
        <PlayerModel />
      </Suspense>
    </group>
  );
}

useGLTF.preload('/models/player.glb');
