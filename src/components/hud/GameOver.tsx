import { useGame } from '../GameProvider'

export function GameOver() {
  const { state, dispatch } = useGame()

  if (state.phase !== 'collapsed') return null

  return (
    <div
      role="dialog"
      aria-label="Game Over"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        background: 'rgba(0,0,0,0.55)',
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
    >
      <div style={{ color: '#fff', fontSize: 28, fontWeight: 800, letterSpacing: 2 }}>
        GAME OVER
      </div>
      <div
        style={{
          color: '#ffd95a',
          fontSize: 44,
          fontWeight: 800,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {state.score.toFixed(1)} cm
      </div>
      <button
        type="button"
        onClick={() => dispatch({ type: 'RESTART' })}
        style={{
          padding: '12px 36px',
          fontSize: 18,
          fontWeight: 700,
          background: '#e74c3c',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          cursor: 'pointer',
          touchAction: 'manipulation',
        }}
      >
        RESTART
      </button>
    </div>
  )
}
