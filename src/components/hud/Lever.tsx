import { useGame } from '../GameProvider'

export function Lever() {
  const { state, dispatch } = useGame()

  if (state.phase !== 'idle') return null

  return (
    <div style={{
      position: 'absolute',
      right: 24,
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      userSelect: 'none',
    }}>
      <div style={{ fontSize: 12, color: '#555' }}>PULL</div>
      {/* TODO: ドラッグでゲーム開始するレバーUIを実装する */}
      <button
        onClick={() => dispatch({ type: 'START' })}
        style={{
          width: 48,
          height: 120,
          background: '#e74c3c',
          border: 'none',
          borderRadius: 24,
          cursor: 'pointer',
          color: '#fff',
          fontSize: 11,
          fontWeight: 'bold',
        }}
      >
        ▼
      </button>
    </div>
  )
}
