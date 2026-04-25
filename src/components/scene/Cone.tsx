import { useRef } from 'react'
import { DoubleSide, type Mesh } from 'three'
import { useFrame } from '@react-three/fiber'
import { CONE_BASE_RADIUS, CONE_HEIGHT, CONE_TOP_RADIUS } from '../../game/constants'
import { useGame } from '../GameProvider'

/**
 * Ice-cream cone: tip at world (0, 0, 0), opening upward at y = CONE_HEIGHT.
 * Sinks downward in Y while running once the cream is high enough.
 */
export function Cone() {
  const { gameRef } = useGame()
  const groupRef = useRef<Mesh>(null)

  useFrame(() => {
    const mesh = groupRef.current
    if (!mesh) return
    mesh.position.y = CONE_HEIGHT / 2 + gameRef.current.coneSinkY
  })

  return (
    <mesh ref={groupRef} position={[0, CONE_HEIGHT / 2, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[CONE_TOP_RADIUS, CONE_BASE_RADIUS, CONE_HEIGHT, 24, 1, true]} />
      <meshStandardMaterial color="#d4a96a" roughness={0.7} side={DoubleSide} />
    </mesh>
  )
}
