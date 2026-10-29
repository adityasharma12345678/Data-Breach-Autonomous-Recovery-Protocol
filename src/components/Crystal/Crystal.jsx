/**
 * Crystal – Data Fragment Collectible
 *
 * Procedural octahedron mesh (intentional engineering decision –
 * avoids asset complexity and improves runtime performance).
 *
 * Features:
 * - Floating animation (sin wave)
 * - Continuous Y-axis rotation
 * - Cyan emissive glow
 * - Point light for environment illumination
 * - Proximity-based collection (player walks over it)
 * - Particle burst on collection
 * - Auto-removes from scene when collected
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COLLECT_RADIUS = 1.5;

function buildParticles(position) {
  return Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const speed = 2 + Math.random() * 3;
    return {
      vx: Math.cos(angle) * speed,
      vy: 1 + Math.random() * 3,
      vz: Math.sin(angle) * speed,
      x: position[0],
      y: (position[1] ?? 0) + 0.9,
      z: position[2],
      ref: null,
    };
  });
}

function CollectParticles({ position }) {
  const particles = useMemo(() => buildParticles(position), [position]);
  const elapsed   = useRef(0);

  useFrame((_, delta) => {
    elapsed.current += delta;
    particles.forEach((p) => {
      p.x += p.vx * delta;
      p.y += p.vy * delta - 2 * delta * elapsed.current;
      p.z += p.vz * delta;
      if (p.ref) {
        p.ref.position.set(p.x, p.y, p.z);
        const t = elapsed.current / 0.8;
        const op = Math.max(0, 1 - t);
        p.ref.material.opacity = op;
      }
    });
  });

  return (
    <group>
      {particles.map((p, i) => (
        <mesh
          key={i}
          position={[p.x, p.y, p.z]}
          ref={(r) => { p.ref = r; }}
        >
          <sphereGeometry args={[0.06, 4, 4]} />
          <meshBasicMaterial
            color="#00c8ff"
            transparent
            opacity={1}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function Crystal({ position = [0, 0, 0], onCollect, playerRef }) {
  const crystalRef = useRef();
  const orbitRef   = useRef();
  const haloRef    = useRef();
  const materialRef = useRef();
  const [collected, setCollected]   = useState(false);
  const [particles, setParticles]   = useState(false);
  const baseY      = position[1] ?? 0;
  const posX = position[0] ?? 0;
  const posZ = position[2] ?? 0;

  useEffect(() => {
    if (!particles) return undefined;
    const timeout = setTimeout(() => setParticles(false), 800);
    return () => clearTimeout(timeout);
  }, [particles]);

  useFrame(({ clock }) => {
    if (collected || !crystalRef.current) return;

    const t = clock.elapsedTime;
    crystalRef.current.position.y = baseY + 0.9 + Math.sin(t * 1.8) * 0.17;
    crystalRef.current.rotation.y = t * 0.8;
    crystalRef.current.rotation.x = Math.sin(t * 0.7) * 0.12;
    if (orbitRef.current) orbitRef.current.rotation.y = -t * 0.55;
    if (haloRef.current) haloRef.current.scale.setScalar(1 + Math.sin(t * 2.4) * 0.08);

    if (materialRef.current) {
      materialRef.current.emissiveIntensity = 2.5 + Math.sin(t * 3) * 0.7;
    }

    // Proximity collection
    const player = playerRef?.current;
    if (player) {
      const px = player.x - posX;
      const pz = player.z - posZ;
      const dist = Math.sqrt(px * px + pz * pz);
      if (dist < COLLECT_RADIUS) {
        setCollected(true);
        setParticles(true);
        onCollect?.();
      }
    }
  });

  if (collected && !particles) return null;
  if (collected && particles) return <CollectParticles position={position} />;

  return (
    <group position={[posX, 0, posZ]}>
      <mesh ref={haloRef} position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.52, 0.76, 48]} />
        <meshBasicMaterial
          color="#00d9ff"
          transparent
          opacity={0.48}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.8, 8]} />
        <meshBasicMaterial color="#51eaff" transparent opacity={0.16} toneMapped={false} />
      </mesh>
      <group ref={crystalRef}>
        <mesh>
          <octahedronGeometry args={[0.48, 0]} />
          <meshStandardMaterial
            ref={materialRef}
            color="#80f4ff"
            emissive="#00c8ff"
            emissiveIntensity={2.5}
            metalness={0.72}
            roughness={0.16}
            toneMapped={false}
          />
        </mesh>
        <mesh scale={0.56}>
          <octahedronGeometry args={[0.48, 0]} />
          <meshBasicMaterial color="#efffff" toneMapped={false} />
        </mesh>
      </group>
      <mesh ref={orbitRef} position={[0, 0.9, 0]} rotation={[Math.PI / 2, 0.35, 0]}>
        <torusGeometry args={[0.58, 0.018, 6, 40]} />
        <meshBasicMaterial color="#b4fbff" transparent opacity={0.82} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.9, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
    </group>
  );
}
