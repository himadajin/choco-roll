import { describe, expect, it } from 'vitest'
import { act, fireEvent, render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { GameProvider, useGame } from '../GameProvider'
import { GameOver } from './GameOver'

function Helper({ children }: { children: ReactNode }) {
  return <GameProvider>{children}</GameProvider>
}

function PhaseDriver({ onReady }: { onReady: (api: ReturnType<typeof useGame>) => void }) {
  const api = useGame()
  // Expose the API in a render-effect-free way
  onReady(api)
  return null
}

describe('GameOver', () => {
  it('does not render while idle', () => {
    const { queryByRole } = render(
      <Helper>
        <GameOver />
      </Helper>,
    )
    expect(queryByRole('dialog')).toBeNull()
  })

  it('renders score and a restart button while collapsed', () => {
    let api: ReturnType<typeof useGame> | null = null
    const { getByRole, getByText } = render(
      <Helper>
        <PhaseDriver onReady={(a) => (api = a)} />
        <GameOver />
      </Helper>,
    )
    // Drive: idle -> running -> collapsed
    act(() => api!.dispatch({ type: 'START' }))
    act(() => api!.dispatch({ type: 'COLLAPSE', score: 7.5 }))

    expect(getByRole('dialog')).toBeInTheDocument()
    expect(getByText('7.5 cm')).toBeInTheDocument()
    expect(getByRole('button', { name: /RESTART/ })).toBeInTheDocument()
  })

  it('returns to idle when RESTART is clicked', () => {
    let api: ReturnType<typeof useGame> | null = null
    const { getByRole, queryByRole } = render(
      <Helper>
        <PhaseDriver onReady={(a) => (api = a)} />
        <GameOver />
      </Helper>,
    )
    act(() => api!.dispatch({ type: 'START' }))
    act(() => api!.dispatch({ type: 'COLLAPSE', score: 1 }))

    fireEvent.click(getByRole('button', { name: /RESTART/ }))
    expect(queryByRole('dialog')).toBeNull()
    expect(api!.state.phase).toBe('idle')
  })
})
