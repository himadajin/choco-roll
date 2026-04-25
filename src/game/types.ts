import type { Vector3 } from 'three'

export type Phase = 'idle' | 'running' | 'collapsed'

export interface GameRefState {
  /** Recorded cream points, oldest first. y is world-space height. */
  creamPoints: Vector3[]
  /** Current nozzle XZ position in world space (Y is derived from time). */
  nozzleX: number
  nozzleZ: number
  /** Total seconds spent in the current run. */
  elapsed: number
  /** Accumulator since last cream point was emitted. */
  pointTimer: number
  /** Latest cream tip Y. */
  topY: number
  /** Distance from CoM to cone center on XZ. */
  offset: number
  /** Smoothed lean angle (radians) used by the renderer. */
  leanAngle: number
  /** Smoothed cone sink Y (non-positive). */
  coneSinkY: number
  /** Current displayed score (cm above cone top). */
  score: number
}
