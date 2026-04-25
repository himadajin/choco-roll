import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import { Vector3 } from 'three'
import { CREAM_BASE_Y } from '../game/constants'
import type { GameRefState, Phase } from '../game/types'

interface State {
  phase: Phase
  /** Score is only set when collapsing; otherwise 0. The HUD reads live score from the ref while running. */
  score: number
}

type Action = { type: 'START' } | { type: 'COLLAPSE'; score: number } | { type: 'RESTART' }

const initialState: State = { phase: 'idle', score: 0 }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START':
      // Ignore double-starts.
      if (state.phase !== 'idle') return state
      return { phase: 'running', score: 0 }
    case 'COLLAPSE':
      if (state.phase !== 'running') return state
      return { phase: 'collapsed', score: action.score }
    case 'RESTART':
      return { ...initialState }
    default:
      return state
  }
}

function createInitialRef(): GameRefState {
  return {
    creamPoints: [],
    nozzleX: 0,
    nozzleZ: 0,
    elapsed: 0,
    pointTimer: 0,
    topY: 0,
    offset: 0,
    leanAngle: 0,
    coneSinkY: 0,
    score: 0,
  }
}

interface GameContextValue {
  state: State
  dispatch: React.Dispatch<Action>
  /** Mutable per-frame state. Do not read from this for re-renders. */
  gameRef: React.MutableRefObject<GameRefState>
  /** Reset the mutable ref to a fresh run. */
  resetGameRef: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const gameRef = useRef<GameRefState>(createInitialRef())

  const resetGameRef = useCallback(() => {
    const fresh = createInitialRef()
    gameRef.current.creamPoints = fresh.creamPoints
    gameRef.current.nozzleX = fresh.nozzleX
    gameRef.current.nozzleZ = fresh.nozzleZ
    gameRef.current.elapsed = fresh.elapsed
    gameRef.current.pointTimer = fresh.pointTimer
    gameRef.current.topY = fresh.topY
    gameRef.current.offset = fresh.offset
    gameRef.current.leanAngle = fresh.leanAngle
    gameRef.current.coneSinkY = fresh.coneSinkY
    gameRef.current.score = fresh.score
  }, [])

  // Reset whenever we go (back) to idle.
  useEffect(() => {
    if (state.phase === 'idle') {
      resetGameRef()
    }
  }, [state.phase, resetGameRef])

  // Seed the cream points list on START so CatmullRomCurve3 has a valid base.
  useEffect(() => {
    if (state.phase === 'running') {
      const ref = gameRef.current
      ref.creamPoints = [new Vector3(0, CREAM_BASE_Y, 0), new Vector3(0, CREAM_BASE_Y + 0.02, 0)]
      ref.elapsed = 0
      ref.pointTimer = 0
      ref.topY = CREAM_BASE_Y + 0.02
      ref.offset = 0
      ref.leanAngle = 0
      ref.coneSinkY = 0
      ref.score = 0
    }
  }, [state.phase])

  const value = useMemo<GameContextValue>(
    () => ({ state, dispatch, gameRef, resetGameRef }),
    [state, resetGameRef],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside GameProvider')
  return ctx
}
