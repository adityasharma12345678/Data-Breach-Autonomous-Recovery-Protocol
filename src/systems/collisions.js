import {
  ARENA_HALF_SIZE,
  ENERGY_CORE_POSITIONS,
  PLAYER_BOUNDS,
  PLAYER_RADIUS,
  SERVER_NODE_POSITIONS,
  SERVER_RACK_POSITIONS,
  TERMINAL_POSITIONS,
} from './worldLayout';

const CIRCULAR_COLLIDERS = [
  ...ENERGY_CORE_POSITIONS.map(([x, , z]) => ({ x, z, radius: 0.75 })),
  ...SERVER_NODE_POSITIONS.map(([x, , z]) => ({ x, z, radius: 0.7 })),
  ...TERMINAL_POSITIONS.map(([x, , z]) => ({ x, z, radius: 0.55 })),
];

const RACK_HALF_WIDTH = 0.35;
const RACK_HALF_DEPTH = 0.25;

function collides(x, z) {
  const radiusSquared = PLAYER_RADIUS * PLAYER_RADIUS;

  for (const [rackX, , rackZ] of SERVER_RACK_POSITIONS) {
    const closestX = Math.max(rackX - RACK_HALF_WIDTH, Math.min(x, rackX + RACK_HALF_WIDTH));
    const closestZ = Math.max(rackZ - RACK_HALF_DEPTH, Math.min(z, rackZ + RACK_HALF_DEPTH));
    const dx = x - closestX;
    const dz = z - closestZ;
    if (dx * dx + dz * dz < radiusSquared) return true;
  }

  for (const collider of CIRCULAR_COLLIDERS) {
    const radius = PLAYER_RADIUS + collider.radius;
    const dx = x - collider.x;
    const dz = z - collider.z;
    if (dx * dx + dz * dz < radius * radius) return true;
  }

  return false;
}

export function resolvePlayerMovement(position, deltaX, deltaZ) {
  const limit = Math.min(PLAYER_BOUNDS, ARENA_HALF_SIZE - PLAYER_RADIUS);
  const nextX = Math.max(-limit, Math.min(limit, position.x + deltaX));
  const nextZ = Math.max(-limit, Math.min(limit, position.z + deltaZ));

  if (!collides(nextX, position.z)) position.x = nextX;
  if (!collides(position.x, nextZ)) position.z = nextZ;
}
