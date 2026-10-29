/**
 * Terminal – Interactive AI Terminal Kiosks (WOW Feature)
 *
 * The player presses E near a terminal to open a full-screen
 * terminal UI with live-updating diagnostic data — the flagship
 * "WOW" feature of the game.
 *
 * In-world: procedural kiosk geometry with a glowing screen.
 * UI: rendered in DOM (not WebGL) for maximum CSS control.
 */

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

const INTERACT_RADIUS = 2.8;

export default function Terminal({
  position = [0, 0, 0],
  playerRef,
  onNearby,
  onOpen,
  keysRef,
  id,
}) {
  const groupRef   = useRef();
  const screenRef  = useRef();
  const nearbyRef  = useRef(false);
  const eWasDown   = useRef(false);
  const [accessed, setAccessed] = useState(false);

  useFrame(({ clock }) => {
    const player = playerRef?.current;
    if (!player || !groupRef.current) return;

    const dist = Math.sqrt(
      (player.x - position[0]) ** 2 +
      (player.z - (position[2] ?? 0)) ** 2
    );
    const nearby = dist < INTERACT_RADIUS;

    if (nearby !== nearbyRef.current) {
      nearbyRef.current = nearby;
      onNearby?.(nearby, id);
    }

    // Animate screen flicker
    if (screenRef.current) {
      const t = clock.elapsedTime;
      const flicker = 1.0 + Math.sin(t * 23) * 0.08 + Math.sin(t * 7) * 0.06;
      screenRef.current.material.emissiveIntensity = accessed ? 1.5 : flicker;
    }

    // E key
    const eDown = keysRef?.current?.['KeyE'] ?? false;
    if (nearby && eDown && !eWasDown.current) {
      eWasDown.current = true;
      setAccessed(true);
      onOpen?.(id, position);
    }
    if (!eDown) eWasDown.current = false;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Base */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 0.3, 8]} />
        <meshStandardMaterial color="#0d1f35" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Pillar */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1.2, 8]} />
        <meshStandardMaterial color="#1a3050" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Screen housing */}
      <mesh position={[0, 1.7, 0]} rotation={[Math.PI * 0.1, 0, 0]}>
        <boxGeometry args={[1.0, 0.65, 0.08]} />
        <meshStandardMaterial color="#0a1a2e" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Screen face */}
      <mesh ref={screenRef} position={[0, 1.7, 0.045]} rotation={[Math.PI * 0.1, 0, 0]}>
        <planeGeometry args={[0.88, 0.55]} />
        <meshStandardMaterial
          color={accessed ? '#001a33' : '#001020'}
          emissive={accessed ? '#00c8ff' : '#003344'}
          emissiveIntensity={1}
        />
      </mesh>
      <group position={[0, 1.7, 0.052]} rotation={[Math.PI * 0.1, 0, 0]}>
        <mesh position={[-0.22, 0.08, 0]}>
          <planeGeometry args={[0.38, 0.025]} />
          <meshBasicMaterial color="#49eaff" toneMapped={false} />
        </mesh>
        <mesh position={[-0.3, 0.015, 0]}>
          <planeGeometry args={[0.22, 0.018]} />
          <meshBasicMaterial color="#1a91c4" toneMapped={false} />
        </mesh>
        <mesh position={[-0.12, -0.06, 0]}>
          <planeGeometry args={[0.58, 0.015]} />
          <meshBasicMaterial color="#276b88" toneMapped={false} />
        </mesh>
        <mesh position={[0.29, -0.08, 0]}>
          <planeGeometry args={[0.1, 0.08]} />
          <meshBasicMaterial color="#ff344d" transparent opacity={0.8} toneMapped={false} />
        </mesh>
      </group>
      {/* Top light strip */}
      <mesh position={[0, 2.05, 0]}>
        <boxGeometry args={[1.0, 0.04, 0.06]} />
        <meshStandardMaterial
          color="#00c8ff"
          emissive="#00c8ff"
          emissiveIntensity={accessed ? 4 : 1.5}
        />
      </mesh>
      {/* Point light */}
      <pointLight
        color={accessed ? '#00c8ff' : '#003344'}
        intensity={accessed ? 2 : 0.8}
        distance={3.5}
        position={[0, 1.7, 0.5]}
      />
      {/* Label */}
      <Text
        position={[0, 2.35, 0]}
        fontSize={0.18}
        color={accessed ? '#00ff9d' : '#00c8ff'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {accessed ? 'TERMINAL: ACCESSED' : 'TERMINAL'}
      </Text>
    </group>
  );
}
