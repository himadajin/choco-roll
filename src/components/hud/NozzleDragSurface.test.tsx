import { describe, expect, it } from 'vitest'
import { act, fireEvent, render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { GameProvider, useGame } from '../GameProvider'
import { NOZZLE_DRAG_SENSITIVITY } from '../../game/constants'
import { NozzleDragSurface } from './NozzleDragSurface'

function PhaseDriver({ onReady }: { onReady: (api: ReturnType<typeof useGame>) => void }) {
  const api = useGame()
  onReady(api)
  return null
}

function Wrap({ children }: { children: ReactNode }) {
  return <GameProvider>{children}</GameProvider>
}

function patchPointerCapture(el: Element) {
  if (!('setPointerCapture' in el)) {
    Object.assign(el, {
      setPointerCapture: () => {},
      releasePointerCapture: () => {},
      hasPointerCapture: () => false,
    })
  }
}

describe('NozzleDragSurface', () => {
  it('does not render while idle or collapsed', () => {
    const { container } = render(
      <Wrap>
        <NozzleDragSurface />
      </Wrap>,
    )
    expect(container.querySelector('[aria-label="Drag to move nozzle"]')).toBeNull()
  })

  it('renders only while running and updates the nozzle ref on drag', () => {
    let api: ReturnType<typeof useGame> | null = null
    const { container } = render(
      <Wrap>
        <PhaseDriver onReady={(a) => (api = a)} />
        <NozzleDragSurface />
      </Wrap>,
    )
    act(() => api!.dispatch({ type: 'START' }))
    const surface = container.querySelector('[aria-label="Drag to move nozzle"]')!
    expect(surface).toBeInTheDocument()
    patchPointerCapture(surface)
    fireEvent.pointerDown(surface, { clientX: 100, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(surface, { clientX: 150, clientY: 130, pointerId: 1 })
    fireEvent.pointerUp(surface, { clientX: 150, clientY: 130, pointerId: 1 })

    expect(api!.gameRef.current.nozzleX).toBeCloseTo(50 * NOZZLE_DRAG_SENSITIVITY)
    expect(api!.gameRef.current.nozzleZ).toBeCloseTo(30 * NOZZLE_DRAG_SENSITIVITY)
  })

  it('clamps the nozzle within the configured radius', () => {
    let api: ReturnType<typeof useGame> | null = null
    const { container } = render(
      <Wrap>
        <PhaseDriver onReady={(a) => (api = a)} />
        <NozzleDragSurface />
      </Wrap>,
    )
    act(() => api!.dispatch({ type: 'START' }))
    const surface = container.querySelector('[aria-label="Drag to move nozzle"]')!
    patchPointerCapture(surface)
    // Drag a huge distance well beyond NOZZLE_MAX_RADIUS
    fireEvent.pointerDown(surface, { clientX: 0, clientY: 0, pointerId: 1 })
    fireEvent.pointerMove(surface, { clientX: 5000, clientY: 0, pointerId: 1 })
    fireEvent.pointerUp(surface, { clientX: 5000, clientY: 0, pointerId: 1 })

    const r = Math.sqrt(api!.gameRef.current.nozzleX ** 2 + api!.gameRef.current.nozzleZ ** 2)
    expect(r).toBeLessThanOrEqual(1.0001)
    expect(r).toBeGreaterThan(0.5)
  })
})
