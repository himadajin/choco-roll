export interface XZ {
  x: number
  z: number
}

export interface XZY extends XZ {
  y: number
}

const ORIGIN: Readonly<XZ> = { x: 0, z: 0 }

/**
 * XZ center of mass for the cream point cloud (uniform mass per point).
 */
export function computeCenterOfMass(points: ReadonlyArray<XZ>): XZ {
  if (points.length === 0) return { x: 0, z: 0 }
  let sx = 0
  let sz = 0
  for (const p of points) {
    sx += p.x
    sz += p.z
  }
  return { x: sx / points.length, z: sz / points.length }
}

/**
 * XZ distance between two points.
 */
export function computeOffset(com: XZ, coneCenter: XZ = ORIGIN): number {
  const dx = com.x - coneCenter.x
  const dz = com.z - coneCenter.z
  return Math.sqrt(dx * dx + dz * dz)
}

/**
 * Collapse threshold shrinks with height: threshold = base / (1 + factor * height).
 * Always strictly positive for non-negative inputs.
 */
export function computeCollapseThreshold(
  height: number,
  base: number,
  heightFactor: number,
): number {
  const safeHeight = Math.max(0, height)
  return base / (1 + heightFactor * safeHeight)
}

export function isCollapsed(offset: number, threshold: number): boolean {
  return offset > threshold
}

/**
 * Lean angle (radians) is proportional to offset, capped at max.
 */
export function computeLeanAngle(offset: number, factor: number, max: number): number {
  if (offset <= 0) return 0
  return Math.min(offset * factor, max)
}

/**
 * Unit axis (in XZ) around which to rotate the cream stack so the top tilts
 * toward the offset direction. Rotation is right-handed about this axis.
 */
export function computeLeanAxis(com: XZ, coneCenter: XZ = ORIGIN): XZ {
  const dx = com.x - coneCenter.x
  const dz = com.z - coneCenter.z
  const len = Math.sqrt(dx * dx + dz * dz)
  if (len < 1e-6) return { x: 1, z: 0 }
  // Right-hand rule: rotation axis perpendicular to offset direction in XZ.
  // To tilt toward +offset, we rotate around the perpendicular vector (-dz, dx)/len.
  return { x: -dz / len, z: dx / len }
}

/**
 * Clamp an XZ position to within a circle centered at the origin.
 */
export function clampNozzlePosition(x: number, z: number, maxRadius: number): XZ {
  if (maxRadius <= 0) return { x: 0, z: 0 }
  const r = Math.sqrt(x * x + z * z)
  if (r <= maxRadius) return { x, z }
  const k = maxRadius / r
  return { x: x * k, z: z * k }
}

/**
 * Cone sink Y offset (a non-positive number). Returns 0 below startHeight,
 * grows linearly past it, and is clamped to -maxSink.
 */
export function computeConeSinkY(
  height: number,
  startHeight: number,
  factor: number,
  maxSink: number,
): number {
  const excess = height - startHeight
  if (excess <= 0) return 0
  return -Math.min(excess * factor, maxSink)
}

/**
 * Apply a screen-space drag delta to a nozzle XZ position with sensitivity.
 * Right (dx > 0) -> +X, down (dy > 0) -> +Z. Result is clamped to maxRadius.
 */
export function applyDragToNozzle(
  current: XZ,
  dxPixels: number,
  dyPixels: number,
  sensitivity: number,
  maxRadius: number,
): XZ {
  const nx = current.x + dxPixels * sensitivity
  const nz = current.z + dyPixels * sensitivity
  return clampNozzlePosition(nx, nz, maxRadius)
}

/**
 * Cream column Y at the latest tip, derived purely from elapsed time.
 */
export function creamTopY(elapsed: number, riseRate: number, baseY: number): number {
  return baseY + Math.max(0, elapsed) * riseRate
}

export interface GameTickInput {
  dt: number
  elapsed: number
  nozzleXZ: XZ
  pointTimer: number
  pointInterval: number
  riseRate: number
  baseY: number
}

export interface GameTickResult {
  elapsed: number
  pointTimer: number
  topY: number
  /**
   * Points that should be appended to the cream during this tick (zero or more).
   * We may emit several in a single tick to handle large dt without skipping.
   */
  emitted: XZY[]
}

/**
 * Advance the per-frame state. Pure: caller owns the cream array and applies
 * the emitted points. We emit at most one point per pointInterval, but allow
 * multiple per tick if dt overshoots so the cream remains continuous.
 */
export function tickGame(input: GameTickInput): GameTickResult {
  const elapsed = input.elapsed + input.dt
  const topY = creamTopY(elapsed, input.riseRate, input.baseY)
  let pointTimer = input.pointTimer + input.dt
  const emitted: XZY[] = []
  // Cap emission to avoid runaway loops if pointInterval is misconfigured.
  const maxEmissions = 8
  while (pointTimer >= input.pointInterval && emitted.length < maxEmissions) {
    pointTimer -= input.pointInterval
    // Approximate the Y at the moment the point was emitted (between last and current top).
    const tickProgress = pointTimer / Math.max(input.dt, 1e-6)
    const emitY = topY - tickProgress * input.dt * input.riseRate
    emitted.push({ x: input.nozzleXZ.x, y: emitY, z: input.nozzleXZ.z })
  }
  return { elapsed, pointTimer, topY, emitted }
}

/**
 * Linear interpolation utility used for visual smoothing.
 */
export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t
}
