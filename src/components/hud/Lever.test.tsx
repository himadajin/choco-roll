import { describe, expect, it } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import { GameProvider } from '../GameProvider'
import { LEVER_PULL_THRESHOLD } from '../../game/constants'
import { Lever } from './Lever'

function setup() {
  return render(
    <GameProvider>
      <Lever />
    </GameProvider>,
  )
}

// happy-dom doesn't ship setPointerCapture for our element type; stub it.
function patchPointerCapture(el: Element) {
  if (!('setPointerCapture' in el)) {
    Object.assign(el, {
      setPointerCapture: () => {},
      releasePointerCapture: () => {},
      hasPointerCapture: () => false,
    })
  }
}

describe('Lever', () => {
  it('renders the slider while idle', () => {
    const { getByRole } = setup()
    expect(getByRole('slider')).toBeInTheDocument()
  })

  it('does not start the game on a small drag below threshold', () => {
    const { getByRole, queryByRole } = setup()
    const slider = getByRole('slider')
    patchPointerCapture(slider)
    fireEvent.pointerDown(slider, { clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(slider, { clientY: 110, pointerId: 1 })
    fireEvent.pointerUp(slider, { clientY: 110, pointerId: 1 })
    // Still idle -> slider should still be present.
    expect(queryByRole('slider')).toBeInTheDocument()
  })

  it('starts the game once the pull exceeds the threshold', () => {
    const { getByRole, queryByRole } = setup()
    const slider = getByRole('slider')
    patchPointerCapture(slider)
    fireEvent.pointerDown(slider, { clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(slider, {
      clientY: 100 + LEVER_PULL_THRESHOLD + 5,
      pointerId: 1,
    })
    fireEvent.pointerUp(slider, { clientY: 100 + LEVER_PULL_THRESHOLD + 5, pointerId: 1 })
    // Now in running -> slider should disappear.
    expect(queryByRole('slider')).not.toBeInTheDocument()
  })

  it('updates the aria-valuenow as the user drags', () => {
    const { getByRole } = setup()
    const slider = getByRole('slider')
    patchPointerCapture(slider)
    fireEvent.pointerDown(slider, { clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(slider, { clientY: 130, pointerId: 1 })
    expect(slider.getAttribute('aria-valuenow')).toBe('30')
  })
})
