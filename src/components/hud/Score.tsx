import { useGame } from '../GameProvider'

export function Score() {
  const { state } = useGame()

  if (state.phase !== 'running') return null

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.4)',
        color: '#fff',
        padding: '4px 16px',
        borderRadius: 20,
        fontSize: 20,
        fontWeight: 'bold',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {state.score.toFixed(1)} cm
    </div>
  )
}
