import type { Vector3Tuple } from 'three'

// Cylindrical hall dimensions
export const CYLINDER_RADIUS = 12
export const RING_COUNT = 2
export const RING_0_COUNT = 13  // bottom ring
export const RING_1_COUNT = 12  // top ring (half-step angular offset)
export const RING_Y_POSITIONS = [-1.2, 1.5] as const
export const TOTAL_POLYMATHS = RING_0_COUNT + RING_1_COUNT // 25

// Alcove dimensions
export const ALCOVE_WIDTH = 3.2
export const ALCOVE_HEIGHT = 3.0
export const ALCOVE_DEPTH = 2.0

// Camera
export const CAMERA_FOV = 65
export const CAMERA_NEAR = 0.1
export const CAMERA_FAR = 100

// Entrance card — the visual anchor the camera returns to on "Back to Hall".
// Placed at angle π (180°), exactly between ring 0 alcoves 6 and 7.
export const ENTRANCE_ANGLE = Math.PI
export const ENTRANCE_Y = 0.15 // centered between ring 0 (y=-1.2) and ring 1 (y=1.5)
export const ENTRANCE_POSITION: Vector3Tuple = [
  Math.sin(ENTRANCE_ANGLE) * CYLINDER_RADIUS,  // ≈ 0
  ENTRANCE_Y,
  Math.cos(ENTRANCE_ANGLE) * CYLINDER_RADIUS,  // -12
]

// Camera "home" — at center, facing the entrance card on the wall.
// OrbitControls target is 1 unit toward the entrance for responsive orbiting.
export const ENTRANCE_CAMERA_POS: Vector3Tuple = [0, 0.5, 0.01]
export const ENTRANCE_CAMERA_LOOK: Vector3Tuple = [0, 0.15, -4]

// Navigation depths
export const HALL_VIEW_DISTANCE = 0       // camera at origin
export const ALCOVE_VIEW_DISTANCE = 2     // approach distance from center (10 units from wall)
export const CONVERSATION_VIEW_DISTANCE = 4 // closer for terminal interaction

// Panel sizes within an alcove
export const PORTRAIT_WIDTH = 1.8
export const PORTRAIT_HEIGHT = 2.2
export const TERMINAL_WIDTH = 2.4
export const TERMINAL_HEIGHT = 1.4
export const CONVERSATION_PANEL_WIDTH = 1.6
export const CONVERSATION_PANEL_HEIGHT = 1.0

/**
 * Compute the 3D position and rotation for an alcove on the cylinder.
 * ring: 0 or 1
 * index: position within the ring
 */
export function getAlcoveTransform(ring: number, index: number): {
  position: Vector3Tuple
  rotation: Vector3Tuple
} {
  const count = ring === 0 ? RING_0_COUNT : RING_1_COUNT
  const angularOffset = ring === 1 ? Math.PI / RING_0_COUNT : 0  // half-step offset for ring 1
  const angle = (index / count) * Math.PI * 2 + angularOffset

  const x = Math.sin(angle) * CYLINDER_RADIUS
  const z = Math.cos(angle) * CYLINDER_RADIUS
  const y = RING_Y_POSITIONS[ring]

  // Rotate to face inward (toward camera at origin)
  const rotY = angle + Math.PI

  return {
    position: [x, y, z],
    rotation: [0, rotY, 0],
  }
}

/**
 * Get camera target position when approaching an alcove.
 * Camera moves along the line from origin toward the alcove, stopping at ALCOVE_VIEW_DISTANCE.
 */
export function getAlcoveCameraTarget(ring: number, index: number): {
  position: Vector3Tuple
  lookAt: Vector3Tuple
} {
  const { position } = getAlcoveTransform(ring, index)
  const [ax, ay, az] = position

  // Direction from origin to alcove
  const dist = Math.sqrt(ax * ax + az * az)
  const dirX = ax / dist
  const dirZ = az / dist

  // Camera position: along the direction at ALCOVE_VIEW_DISTANCE from origin
  const camDist = ALCOVE_VIEW_DISTANCE
  return {
    position: [dirX * camDist, ay, dirZ * camDist],
    lookAt: [ax, ay, az],
  }
}
