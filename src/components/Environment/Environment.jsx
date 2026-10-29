/**
 * Environment – Procedural Facility Scene
 *
 * All geometry is procedural (no additional 3D assets needed).
 * Includes:
 * - Tiled grid floor with emissive data pathways
 * - Server rack columns
 * - Energy core pillars
 * - Perimeter boundary walls
 * - Perimeter infrastructure and recovery pathways
 * - Extraction zone (glowing platform)
 * - Ambient particle field (static)
 *
 * Performance: fixed, bounded geometry and emissive details avoid per-rack lights.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  ARENA_HALF_SIZE,
  ENERGY_CORE_POSITIONS,
  SERVER_RACK_POSITIONS,
} from '../../systems/worldLayout';

// ── Server Rack ────────────────────────────────────────────────────────────────
function ServerRack({ position, height = 2.5 }) {
  return (
    <group position={position}>
      {/* Body */}
      <mesh castShadow position={[0, height / 2, 0]}>
        <boxGeometry args={[0.72, height, 0.48]} />
        <meshStandardMaterial color="#18283a" metalness={0.76} roughness={0.38} />
      </mesh>
      <mesh position={[-0.31, height / 2, 0.248]}>
        <boxGeometry args={[0.035, height - 0.12, 0.018]} />
        <meshBasicMaterial color="#1684ac" toneMapped={false} />
      </mesh>
      <mesh position={[0.31, height / 2, 0.248]}>
        <boxGeometry args={[0.035, height - 0.12, 0.018]} />
        <meshBasicMaterial color="#31516a" />
      </mesh>
      {/* Drive bays */}
      {Array.from({ length: Math.floor(height * 2) }, (_, i) => (
        <mesh key={i} position={[0, 0.3 + i * 0.5, 0.253]}>
          <boxGeometry args={[0.48, 0.13, 0.018]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? '#123a50' : '#111b29'}
            emissive={i % 3 === 0 ? '#00aacc' : '#071522'}
            emissiveIntensity={i % 3 === 0 ? 1.2 : 0.12}
          />
        </mesh>
      ))}
      <mesh position={[0, height - 0.08, 0.258]}>
        <boxGeometry args={[0.46, 0.035, 0.025]} />
        <meshBasicMaterial color="#47dbff" toneMapped={false} />
      </mesh>
    </group>
  );
}

// ── Energy Core ────────────────────────────────────────────────────────────────
function EnergyCore({ position }) {
  const coreRef = useRef();
  const ringARef = useRef();
  const ringBRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (coreRef.current) {
      coreRef.current.scale.setScalar(1 + Math.sin(t * 2.5) * 0.05);
    }
    if (ringARef.current) ringARef.current.rotation.y = t * 1.5;
    if (ringBRef.current) ringBRef.current.rotation.x = t * -1.2;
  });

  return (
    <group position={position}>
      {/* Pillar */}
      <mesh receiveShadow>
        <cylinderGeometry args={[0.18, 0.22, 4, 8]} />
        <meshStandardMaterial color="#0a1628" metalness={0.85} roughness={0.3} />
      </mesh>
      {/* Glowing orb */}
      <mesh ref={coreRef} position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color="#1a7fff"
          emissive="#1a7fff"
          emissiveIntensity={3}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Rings */}
      <mesh ref={ringARef} position={[0, 2.2, 0]}>
        <torusGeometry args={[0.45, 0.03, 8, 32]} />
        <meshStandardMaterial color="#1a7fff" emissive="#1a7fff" emissiveIntensity={2} />
      </mesh>
      <mesh ref={ringBRef} position={[0, 2.2, 0]}>
        <torusGeometry args={[0.55, 0.02, 8, 32]} />
        <meshStandardMaterial color="#00c8ff" emissive="#00c8ff" emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

// ── Extraction Zone ────────────────────────────────────────────────────────────
export function ExtractionZone({ unlocked, playerRef, onExtract }) {
  const ringRef   = useRef();
  const beamRef   = useRef();
  const triggered = useRef(false);

  const POS = useMemo(() => new THREE.Vector3(0, 0, -18), []);
  const RADIUS = 3;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ringRef.current) {
      ringRef.current.rotation.y = t * (unlocked ? 2 : 0.3);
      const scale = unlocked ? 1 + Math.sin(t * 3) * 0.05 : 1;
      ringRef.current.scale.setScalar(scale);
    }
    if (beamRef.current) {
      beamRef.current.material.opacity = unlocked ? 0.15 + Math.sin(t * 2) * 0.05 : 0.03;
    }

    // Check for extraction
    if (unlocked && !triggered.current && playerRef?.current) {
      const player = playerRef.current;
      const dist = Math.sqrt(
        (player.x - POS.x) ** 2 +
        (player.z - POS.z) ** 2
      );
      if (dist < RADIUS) {
        triggered.current = true;
        onExtract?.();
      }
    }
  });

  return (
    <group position={[POS.x, 0, POS.z]}>
      {/* Platform floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[RADIUS, 32]} />
        <meshStandardMaterial
          color={unlocked ? '#001a10' : '#0d0d0d'}
          emissive={unlocked ? '#00ff9d' : '#003300'}
          emissiveIntensity={unlocked ? 0.3 : 0.05}
        />
      </mesh>
      {/* Outer ring */}
      <mesh ref={ringRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[RADIUS, 0.1, 4, 48]} />
        <meshStandardMaterial
          color={unlocked ? '#00ff9d' : '#335533'}
          emissive={unlocked ? '#00ff9d' : '#224422'}
          emissiveIntensity={unlocked ? 3 : 0.5}
        />
      </mesh>
      {/* Beam column */}
      <mesh ref={beamRef} position={[0, 5, 0]}>
        <cylinderGeometry args={[RADIUS * 0.7, RADIUS * 0.7, 10, 32, 1, true]} />
        <meshStandardMaterial
          color="#00ff9d"
          emissive="#00ff9d"
          emissiveIntensity={2}
          transparent
          opacity={0.04}
          side={THREE.DoubleSide}
        />
      </mesh>
      {unlocked && <pointLight color="#00ff9d" intensity={3} distance={8} position={[0, 1, 0]} />}
    </group>
  );
}

// ── Ambient particles ────────────────────────────────────────────────────────
function AmbientParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => {
        const t = (i + 1) * 0.61803398875;
        return {
          x: (t % 1 - 0.5) * 42,
          y: 0.5 + ((i * 13.17) % 1) * 4,
          z: ((i * 19.43) % 1 - 0.5) * 42,
          s: 0.02 + ((i * 7.31) % 1) * 0.08,
          phase: i * 0.45,
        };
      }),
    []
  );

  const meshRefs = useRef([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const p = particles[i];
      mesh.position.x = p.x + Math.sin(t * 0.6 + p.phase) * 0.9;
      mesh.position.y = p.y + Math.sin(t * 1.4 + p.phase) * 0.4;
      mesh.position.z = p.z + Math.cos(t * 0.8 + p.phase) * 0.9;
      mesh.material.opacity = 0.2 + (Math.sin(t * 2 + p.phase) + 1) * 0.15;
    });
  });

  return (
    <group>
      {particles.map((p, i) => (
        <mesh
          key={`particle-${i}`}
          ref={(node) => {
            meshRefs.current[i] = node;
          }}
          position={[p.x, p.y, p.z]}
        >
          <sphereGeometry args={[p.s, 6, 6]} />
          <meshStandardMaterial
            color="#7ad7ff"
            emissive="#7ad7ff"
            emissiveIntensity={1.2}
            transparent
            opacity={0.35}
          />
        </mesh>
      ))}
    </group>
  );
}

// ── Floor Grid ─────────────────────────────────────────────────────────────────
function FloorGrid() {
  return (
    <group>
      {/* Main floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[ARENA_HALF_SIZE * 2, ARENA_HALF_SIZE * 2, 24, 24]} />
        <meshStandardMaterial
          color="#142438"
          metalness={0.3}
          roughness={0.72}
          emissive="#14263a"
          emissiveIntensity={0.24}
        />
      </mesh>
      {/* Perimeter seams frame the powered data conduits without a full grid. */}
      {[-16, 16].map((x) => (
        <mesh key={`h${x}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.006, 0]}>
          <planeGeometry args={[0.025, ARENA_HALF_SIZE * 2]} />
          <meshBasicMaterial color="#32728a" transparent opacity={0.16} />
        </mesh>
      ))}
      {[-16, 16].map((z) => (
        <mesh key={`v${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, z]}>
          <planeGeometry args={[ARENA_HALF_SIZE * 2, 0.025]} />
          <meshBasicMaterial color="#32728a" transparent opacity={0.16} />
        </mesh>
      ))}
      {[-8, 8].map((x) => (
        <group key={`conduit-${x}`}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.012, 0]}>
            <planeGeometry args={[0.12, ARENA_HALF_SIZE * 2]} />
            <meshBasicMaterial color="#087eaa" transparent opacity={0.28} toneMapped={false} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x + 0.15, 0.012, 0]}>
            <planeGeometry args={[0.025, ARENA_HALF_SIZE * 2]} />
            <meshBasicMaterial color="#6eeaff" transparent opacity={0.58} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── Boundary Walls ─────────────────────────────────────────────────────────────
function Walls() {
  const W = ARENA_HALF_SIZE * 2;
  const H = 1.35;
  const wallData = [
    { pos: [0, H / 2, -ARENA_HALF_SIZE], rot: [0, 0, 0] },
    { pos: [0, H / 2,  ARENA_HALF_SIZE], rot: [0, Math.PI, 0] },
    { pos: [-ARENA_HALF_SIZE, H / 2, 0], rot: [0,  Math.PI / 2, 0] },
    { pos: [ ARENA_HALF_SIZE, H / 2, 0], rot: [0, -Math.PI / 2, 0] },
  ];

  return (
    <>
      {wallData.map(({ pos, rot }, i) => (
        <mesh key={i} position={pos} rotation={rot} receiveShadow>
          <planeGeometry args={[W, H]} />
          <meshStandardMaterial
            color="#050e1a"
            metalness={0.6}
            roughness={0.5}
            emissive="#003366"
            emissiveIntensity={0.05}
            side={THREE.FrontSide}
          />
        </mesh>
      ))}
      {/* Light strips at wall base */}
      {wallData.map(({ pos, rot }, i) => (
        <mesh key={`strip${i}`} position={[pos[0], 0.05, pos[2]]} rotation={[-Math.PI / 2, 0, rot[1]]}>
          <planeGeometry args={[W, 0.3]} />
          <meshStandardMaterial color="#00c8ff" emissive="#00c8ff" emissiveIntensity={0.6} transparent opacity={0.3} />
        </mesh>
      ))}
    </>
  );
}

// ── Main Environment ────────────────────────────────────────────────────────────
export default function Environment({ extractionUnlocked, playerRef, onExtract }) {
  return (
    <group>
      <AmbientParticles />
      <FloorGrid />
      <Walls />

      {/* Server racks around the perimeter */}
      {SERVER_RACK_POSITIONS.map((p, i) => (
        <ServerRack key={`rack${i}`} position={p} height={2 + (i % 3) * 0.5} />
      ))}

      {/* Energy cores */}
      {ENERGY_CORE_POSITIONS.map((p, i) => <EnergyCore key={`core${i}`} position={p} />)}

      {/* Overhead ambient lights */}
      <pointLight color="#0040aa" intensity={1.5} distance={25} position={[0, 6, 0]} />
      <pointLight color="#002266" intensity={1.0} distance={18} position={[-10, 5, -10]} />
      <pointLight color="#002266" intensity={1.0} distance={18} position={[ 10, 5, -10]} />

      {/* Extraction zone */}
      <ExtractionZone
        unlocked={extractionUnlocked}
        playerRef={playerRef}
        onExtract={onExtract}
      />
    </group>
  );
}
