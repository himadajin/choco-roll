import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { CatmullRomCurve3, TubeGeometry, Vector3, type Group, type Mesh } from 'three'
import { CREAM_BASE_Y, CREAM_TUBE_RADIUS } from '../../game/constants'
import { useGame } from '../GameProvider'

const TUBE_RADIAL_SEGMENTS = 12

function buildSeedGeometry(): TubeGeometry {
  return new TubeGeometry(
    new CatmullRomCurve3(
      [new Vector3(0, CREAM_BASE_Y, 0), new Vector3(0, CREAM_BASE_Y + 0.01, 0)],
      false,
      'catmullrom',
      0.5,
    ),
    2,
    CREAM_TUBE_RADIUS,
    TUBE_RADIAL_SEGMENTS,
    false,
  )
}

/**
 * Renders the cream as a smooth tube along the recorded nozzle trajectory.
 * Geometry is rebuilt imperatively (not via JSX) whenever the points list grows.
 * Lean is applied as a group rotation so individual point coordinates remain
 * unchanged on the underlying data.
 */
export function CreamTube() {
  const { gameRef, state } = useGame()
  const meshRef = useRef<Mesh>(null)
  const groupRef = useRef<Group>(null)
  const lastPointCount = useRef(0)
  const tmpAxis = useMemo(() => new Vector3(), [])

  // Install a seed geometry on mount and dispose on unmount.
  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    mesh.geometry = buildSeedGeometry()
    return () => {
      mesh.geometry.dispose()
    }
  }, [])

  // Reset to seed whenever we re-enter idle.
  useEffect(() => {
    if (state.phase !== 'idle') return
    const mesh = meshRef.current
    if (!mesh) return
    const previous = mesh.geometry
    mesh.geometry = buildSeedGeometry()
    previous.dispose()
    lastPointCount.current = 0
    const group = groupRef.current
    if (group) group.rotation.set(0, 0, 0)
  }, [state.phase])

  useFrame(() => {
    const ref = gameRef.current
    const points = ref.creamPoints
    const mesh = meshRef.current
    const group = groupRef.current
    if (!mesh || !group) return

    if (points.length >= 2 && points.length !== lastPointCount.current) {
      const curve = new CatmullRomCurve3(points, false, 'catmullrom', 0.5)
      const tubularSegments = Math.min(Math.max(16, points.length * 2), 4096)
      const next = new TubeGeometry(
        curve,
        tubularSegments,
        CREAM_TUBE_RADIUS,
        TUBE_RADIAL_SEGMENTS,
        false,
      )
      const previous = mesh.geometry
      mesh.geometry = next
      previous.dispose()
      lastPointCount.current = points.length
    }

    // Lean: rotate the entire stack about an axis perpendicular to the
    // CoM offset direction, anchored at the cone tip (group origin).
    let offsetX = 0
    let offsetZ = 0
    if (points.length > 0) {
      let sx = 0
      let sz = 0
      for (const p of points) {
        sx += p.x
        sz += p.z
      }
      offsetX = sx / points.length
      offsetZ = sz / points.length
    }
    const offsetLen = Math.sqrt(offsetX * offsetX + offsetZ * offsetZ)
    if (offsetLen < 1e-6 || ref.leanAngle < 1e-4) {
      group.rotation.set(0, 0, 0)
    } else {
      tmpAxis.set(-offsetZ / offsetLen, 0, offsetX / offsetLen)
      group.rotation.set(0, 0, 0)
      group.rotateOnAxis(tmpAxis, ref.leanAngle)
    }
  })

  // Pivot the group at the cone top (y = CREAM_BASE_Y) so leaning rotates the
  // cream stack around its base. The inner mesh shifts down to compensate so
  // the geometry, which is in absolute world Y, ends up at the correct height.
  return (
    <group ref={groupRef} position={[0, CREAM_BASE_Y, 0]}>
      <mesh ref={meshRef} position={[0, -CREAM_BASE_Y, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#fff7e6" roughness={0.45} />
      </mesh>
    </group>
  )
}
