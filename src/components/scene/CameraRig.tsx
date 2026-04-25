import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Vector3 } from 'three'
import {
  CAMERA_DISTANCE_XZ,
  CAMERA_FOLLOW_LERP,
  CAMERA_HEIGHT_OFFSET,
  CAMERA_LOOK_OFFSET,
  CONE_HEIGHT,
  CREAM_BASE_Y,
} from '../../game/constants'
import { useGame } from '../GameProvider'

/**
 * Smoothly tracks the cream tip so the player always sees the latest layer.
 * The XZ position is held fixed; only Y is followed.
 */
export function CameraRig() {
  const { gameRef, state } = useGame()
  const targetLook = useRef(new Vector3(0, CONE_HEIGHT * 0.5, 0))

  useFrame((rootState) => {
    const cam = rootState.camera
    const ref = gameRef.current
    const focusY =
      state.phase === 'running'
        ? ref.topY
        : state.phase === 'collapsed'
          ? Math.max(ref.topY, CREAM_BASE_Y)
          : CREAM_BASE_Y

    const desiredCamY = focusY + CAMERA_HEIGHT_OFFSET
    const desiredLookY = focusY + CAMERA_LOOK_OFFSET

    cam.position.x += (0 - cam.position.x) * CAMERA_FOLLOW_LERP
    cam.position.z += (CAMERA_DISTANCE_XZ - cam.position.z) * CAMERA_FOLLOW_LERP
    cam.position.y += (desiredCamY - cam.position.y) * CAMERA_FOLLOW_LERP

    targetLook.current.set(0, desiredLookY, 0)
    cam.lookAt(targetLook.current)
  })

  return null
}
