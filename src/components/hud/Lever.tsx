import { useCallback, useRef, useState } from 'react'
import { LEVER_PULL_THRESHOLD } from '../../game/constants'
import { useGame } from '../GameProvider'

const TRACK_HEIGHT = 180
const HANDLE_HEIGHT = 64
const HANDLE_WIDTH = 56

/**
 * Drag-down lever shown while the game is idle. Pulling it past
 * LEVER_PULL_THRESHOLD pixels triggers START.
 */
export function Lever() {
  const { state, dispatch } = useGame()
  const [pull, setPull] = useState(0)
  const startYRef = useRef<number | null>(null)
  const pointerIdRef = useRef<number | null>(null)
  const triggeredRef = useRef(false)

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    startYRef.current = e.clientY
    pointerIdRef.current = e.pointerId
    triggeredRef.current = false
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (startYRef.current == null) return
      e.preventDefault()
      const dy = Math.max(0, e.clientY - startYRef.current)
      const clamped = Math.min(dy, TRACK_HEIGHT - HANDLE_HEIGHT)
      setPull(clamped)
      if (!triggeredRef.current && dy >= LEVER_PULL_THRESHOLD) {
        triggeredRef.current = true
        dispatch({ type: 'START' })
      }
    },
    [dispatch],
  )

  const onPointerEnd = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (pointerIdRef.current != null && e.currentTarget.hasPointerCapture(pointerIdRef.current)) {
      e.currentTarget.releasePointerCapture(pointerIdRef.current)
    }
    startYRef.current = null
    pointerIdRef.current = null
    setPull(0)
  }, [])

  if (state.phase !== 'idle') return null

  return (
    <div
      style={{
        position: 'absolute',
        right: 18,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        pointerEvents: 'auto',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      <div style={{ fontSize: 11, color: '#444', fontWeight: 600, letterSpacing: 1 }}>PULL</div>
      <div
        role="slider"
        aria-label="Start lever"
        aria-valuemin={0}
        aria-valuemax={LEVER_PULL_THRESHOLD}
        aria-valuenow={Math.round(pull)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        style={{
          position: 'relative',
          width: HANDLE_WIDTH + 12,
          height: TRACK_HEIGHT,
          background: '#eaeaea',
          borderRadius: 24,
          border: '2px solid #c4c4c4',
          overflow: 'hidden',
          touchAction: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 6 + pull,
            transform: 'translateX(-50%)',
            width: HANDLE_WIDTH,
            height: HANDLE_HEIGHT,
            background: '#e74c3c',
            borderRadius: 18,
            color: '#fff',
            fontSize: 22,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
            transition: pull === 0 ? 'top 0.2s ease' : 'none',
          }}
        >
          ▼
        </div>
      </div>
      <div style={{ fontSize: 10, color: '#777' }}>下に引く</div>
    </div>
  )
}
