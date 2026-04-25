import { useEffect, useRef, useState } from 'react'
import { useGame } from '../GameProvider'

/**
 * Live score (cm) shown during running. Reads from the mutable game ref via
 * a small RAF loop so the gameplay frame doesn't trigger React re-renders.
 */
export function Score() {
  const { state, gameRef } = useGame()
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (state.phase !== 'running') return
    let active = true
    const tick = () => {
      if (!active) return
      const next = gameRef.current.score
      setDisplayed((prev) => (Math.abs(prev - next) > 0.05 ? next : prev))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      active = false
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [state.phase, gameRef])

  if (state.phase !== 'running') return null

  return (
    <div
      role="status"
      style={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.55)',
        color: '#fff',
        padding: '6px 18px',
        borderRadius: 24,
        fontSize: 22,
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {displayed.toFixed(1)} cm
    </div>
  )
}
