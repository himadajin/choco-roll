import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { CREAM_BASE_Y, NOZZLE_VISUAL_OFFSET_Y } from '../../game/constants'
import { useGame } from '../GameProvider'

/**
 * The dispensing tip. Tracks the user's XZ input and rides on top of the cream
 * column so it always sits just above the latest layer.
 */
export function Nozzle() {
  const { gameRef, state } = useGame()
  const ref = useRef<Group>(null)

  useFrame(() => {
    const group = ref.current
    if (!group) return
    const g = gameRef.current
    const baseTop = state.phase === 'idle' ? CREAM_BASE_Y : g.topY
    group.position.set(g.nozzleX, baseTop + NOZZLE_VISUAL_OFFSET_Y, g.nozzleZ)
  })

  if (state.phase === 'collapsed') return null

  return (
    <group ref={ref}>
      {/* Outer chrome housing */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.36, 16]} />
        <meshStandardMaterial color="#b8b8c0" metalness={0.7} roughness={0.35} />
      </mesh>
      {/* Tip */}
      <mesh position={[0, -0.05, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.22, 0.1, 16]} />
        <meshStandardMaterial color="#777" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}
