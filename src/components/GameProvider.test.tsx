import { describe, expect, it } from 'vitest'
import { act, render, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { GameProvider, useGame } from './GameProvider'

function wrapper({ children }: { children: ReactNode }) {
  return <GameProvider>{children}</GameProvider>
}

describe('GameProvider', () => {
  it('starts in idle with score 0', () => {
    const { result } = renderHook(() => useGame(), { wrapper })
    expect(result.current.state.phase).toBe('idle')
    expect(result.current.state.score).toBe(0)
  })

  it('transitions idle -> running on START', () => {
    const { result } = renderHook(() => useGame(), { wrapper })
    act(() => result.current.dispatch({ type: 'START' }))
    expect(result.current.state.phase).toBe('running')
  })

  it('ignores duplicate START while running', () => {
    const { result } = renderHook(() => useGame(), { wrapper })
    act(() => result.current.dispatch({ type: 'START' }))
    act(() => result.current.dispatch({ type: 'START' }))
    expect(result.current.state.phase).toBe('running')
  })

  it('transitions running -> collapsed on COLLAPSE with score', () => {
    const { result } = renderHook(() => useGame(), { wrapper })
    act(() => result.current.dispatch({ type: 'START' }))
    act(() => result.current.dispatch({ type: 'COLLAPSE', score: 12.3 }))
    expect(result.current.state.phase).toBe('collapsed')
    expect(result.current.state.score).toBeCloseTo(12.3)
  })

  it('ignores COLLAPSE outside of running', () => {
    const { result } = renderHook(() => useGame(), { wrapper })
    act(() => result.current.dispatch({ type: 'COLLAPSE', score: 99 }))
    expect(result.current.state.phase).toBe('idle')
    expect(result.current.state.score).toBe(0)
  })

  it('returns to idle on RESTART and resets the game ref', () => {
    const { result } = renderHook(() => useGame(), { wrapper })
    act(() => result.current.dispatch({ type: 'START' }))
    // Simulate gameplay mutating the ref.
    result.current.gameRef.current.score = 42
    result.current.gameRef.current.nozzleX = 0.5
    act(() => result.current.dispatch({ type: 'COLLAPSE', score: 42 }))
    act(() => result.current.dispatch({ type: 'RESTART' }))
    expect(result.current.state.phase).toBe('idle')
    expect(result.current.state.score).toBe(0)
    expect(result.current.gameRef.current.score).toBe(0)
    expect(result.current.gameRef.current.nozzleX).toBe(0)
  })

  it('throws if useGame is called outside of provider', () => {
    expect(() => renderHook(() => useGame())).toThrow(/GameProvider/)
  })

  it('renders children', () => {
    const { getByText } = render(
      <GameProvider>
        <span>hello</span>
      </GameProvider>,
    )
    expect(getByText('hello')).toBeInTheDocument()
  })
})
