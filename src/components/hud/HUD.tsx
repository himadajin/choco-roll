import { GameOver } from './GameOver'
import { Lever } from './Lever'
import { NozzleDragSurface } from './NozzleDragSurface'
import { Score } from './Score'

/**
 * HUD overlay. The container itself is non-interactive (pointer-events: none);
 * each child enables its own interaction zone where appropriate so canvas
 * input is never accidentally swallowed.
 */
export function HUD() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      <NozzleDragSurface />
      <Lever />
      <Score />
      <GameOver />
    </div>
  )
}
