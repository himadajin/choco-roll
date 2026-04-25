import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useGame } from '../GameProvider'
import {
  COLLAPSE_BASE_THRESHOLD,
  COLLAPSE_HEIGHT_FACTOR,
  CONE_SINK_FACTOR,
  CONE_SINK_LERP,
  CONE_SINK_MAX,
  CONE_SINK_START_HEIGHT,
  CREAM_BASE_Y,
  CREAM_RISE_RATE,
  LEAN_FACTOR,
  LEAN_LERP,
  LEAN_MAX,
  MAX_CREAM_POINTS,
  POINT_INTERVAL,
} from '../../game/constants'
import {
  computeCenterOfMass,
  computeCollapseThreshold,
  computeConeSinkY,
  computeLeanAngle,
  computeOffset,
  isCollapsed,
  lerp,
  tickGame,
} from '../../game/physics'

/**
 * Headless component that drives per-frame simulation. Reads the mutable
 * gameRef and dispatches COLLAPSE when the stack falls over.
 */
export function GameLoop() {
  const { state, dispatch, gameRef } = useGame()

  useFrame((_, dtRaw) => {
    if (state.phase !== 'running') return
    // Clamp dt to avoid huge jumps after tab-resume.
    const dt = Math.min(dtRaw, 0.05)
    const ref = gameRef.current

    const tick = tickGame({
      dt,
      elapsed: ref.elapsed,
      nozzleXZ: { x: ref.nozzleX, z: ref.nozzleZ },
      pointTimer: ref.pointTimer,
      pointInterval: POINT_INTERVAL,
      riseRate: CREAM_RISE_RATE,
      baseY: CREAM_BASE_Y,
    })

    ref.elapsed = tick.elapsed
    ref.pointTimer = tick.pointTimer
    ref.topY = tick.topY

    if (tick.emitted.length > 0) {
      const points = ref.creamPoints
      for (const p of tick.emitted) {
        points.push(new Vector3(p.x, p.y, p.z))
      }
      // Keep a hard cap on the array length (drop oldest).
      if (points.length > MAX_CREAM_POINTS) {
        points.splice(0, points.length - MAX_CREAM_POINTS)
      }
    }

    // Balance / collapse evaluation
    const com = computeCenterOfMass(ref.creamPoints)
    const offset = computeOffset(com)
    ref.offset = offset

    const heightAboveCone = Math.max(0, ref.topY - CREAM_BASE_Y)
    ref.score = heightAboveCone * 10 // 1 world unit ~= 10cm

    // Visual feedback: lean angle, smoothed
    const targetLean = computeLeanAngle(offset, LEAN_FACTOR, LEAN_MAX)
    ref.leanAngle = lerp(ref.leanAngle, targetLean, LEAN_LERP)

    // Cone sinking gag, smoothed
    const targetSink = computeConeSinkY(
      heightAboveCone,
      CONE_SINK_START_HEIGHT,
      CONE_SINK_FACTOR,
      CONE_SINK_MAX,
    )
    ref.coneSinkY = lerp(ref.coneSinkY, targetSink, CONE_SINK_LERP)

    // Collapse check
    const threshold = computeCollapseThreshold(
      heightAboveCone,
      COLLAPSE_BASE_THRESHOLD,
      COLLAPSE_HEIGHT_FACTOR,
    )
    if (isCollapsed(offset, threshold)) {
      dispatch({ type: 'COLLAPSE', score: ref.score })
    }
  })

  return null
}
