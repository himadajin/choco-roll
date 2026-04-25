import { createContext, useContext, useReducer, type ReactNode } from 'react'

export type GameState = 'idle' | 'running' | 'collapsed'

interface State {
  phase: GameState
  score: number
}

type Action = { type: 'START' } | { type: 'COLLAPSE'; score: number } | { type: 'RESTART' }

const initialState: State = { phase: 'idle', score: 0 }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START':
      return { phase: 'running', score: 0 }
    case 'COLLAPSE':
      return { phase: 'collapsed', score: action.score }
    case 'RESTART':
      return initialState
    default:
      return state
  }
}

interface GameContextValue {
  state: State
  dispatch: React.Dispatch<Action>
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside GameProvider')
  return ctx
}
