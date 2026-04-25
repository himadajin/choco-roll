import { useCallback, useRef } from 'react'
import { NOZZLE_DRAG_SENSITIVITY, NOZZLE_MAX_RADIUS } from '../../game/constants'
import { applyDragToNozzle } from '../../game/physics'
import { useGame } from '../GameProvider'

/**
 * Full-screen surface that captures pointer drags during running and
 * translates them into relative nozzle XZ motion (trackpad-style).
 */
export function NozzleDragSurface() {
  const { state, gameRef } = useGame()
  const lastRef = useRef<{ x: number; y: number; pointerId: number } | null>(null)

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    lastRef.current = { x: e.clientX, y: e.clientY, pointerId: e.pointerId }
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const last = lastRef.current
      if (!last) return
      const dx = e.clientX - last.x
      const dy = e.clientY - last.y
      last.x = e.clientX
      last.y = e.clientY
      const ref = gameRef.current
      const next = applyDragToNozzle(
        { x: ref.nozzleX, z: ref.nozzleZ },
        dx,
        dy,
        NOZZLE_DRAG_SENSITIVITY,
        NOZZLE_MAX_RADIUS,
      )
      ref.nozzleX = next.x
      ref.nozzleZ = next.z
    },
    [gameRef],
  )

  const onPointerEnd = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const last = lastRef.current
    if (last && e.currentTarget.hasPointerCapture(last.pointerId)) {
      e.currentTarget.releasePointerCapture(last.pointerId)
    }
    lastRef.current = null
  }, [])

  if (state.phase !== 'running') return null

  return (
    <div
      aria-label="Drag to move nozzle"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      style={{
        position: 'absolute',
        inset: 0,
        // Below score/lever in stacking order; we render BEFORE Score in the parent.
        pointerEvents: 'auto',
        touchAction: 'none',
        background: 'transparent',
      }}
    />
  )
}
