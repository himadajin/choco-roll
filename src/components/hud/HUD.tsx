import { Lever } from './Lever'
import { Score } from './Score'
import { GameOver } from './GameOver'

export function HUD() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}>
          <Lever />
        </div>
        <Score />
        <GameOver />
      </div>
    </div>
  )
}
