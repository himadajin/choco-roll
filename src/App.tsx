import { Canvas } from '@react-three/fiber'
import {
  CAMERA_DISTANCE_XZ,
  CAMERA_FOV,
  CONE_HEIGHT,
  MOBILE_VIEWPORT_WIDTH,
} from './game/constants'
import { GameProvider } from './components/GameProvider'
import { Cone } from './components/scene/Cone'
import { CreamTube } from './components/scene/CreamTube'
import { Nozzle } from './components/scene/Nozzle'
import { Lighting } from './components/scene/Lighting'
import { GameLoop } from './components/scene/GameLoop'
import { CameraRig } from './components/scene/CameraRig'
import { HUD } from './components/hud/HUD'

export default function App() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: MOBILE_VIEWPORT_WIDTH,
        height: '100%',
        background: '#fef2d8',
        overflow: 'hidden',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.04)',
        margin: '0 auto',
      }}
    >
      <GameProvider>
        <Canvas
          shadows
          camera={{
            position: [0, CONE_HEIGHT, CAMERA_DISTANCE_XZ],
            fov: CAMERA_FOV,
            near: 0.1,
            far: 100,
          }}
          dpr={[1, 2]}
          style={{ position: 'absolute', inset: 0, touchAction: 'none' }}
        >
          <color attach="background" args={['#fef2d8']} />
          <Lighting />
          <Cone />
          <CreamTube />
          <Nozzle />
          <CameraRig />
          <GameLoop />
        </Canvas>
        <HUD />
      </GameProvider>
    </div>
  )
}
