import { useGame } from '../GameProvider'

export function GameOver() {
  const { state, dispatch } = useGame()

  if (state.phase !== 'collapsed') return null

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
      background: 'rgba(0,0,0,0.5)',
    }}>
      <div style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>
        GAME OVER
      </div>
      <div style={{ color: '#ffd700', fontSize: 40, fontWeight: 'bold' }}>
        {state.score.toFixed(1)} cm
      </div>
      <button
        onClick={() => dispatch({ type: 'RESTART' })}
        style={{
          padding: '12px 40px',
          fontSize: 18,
          fontWeight: 'bold',
          background: '#e74c3c',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
        }}
      >
        RESTART
      </button>
    </div>
  )
}
