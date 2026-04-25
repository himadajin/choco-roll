import { Canvas } from '@react-three/fiber'
import { GameProvider } from './components/GameProvider'
import { Cone } from './components/scene/Cone'
import { CreamTube } from './components/scene/CreamTube'
import { Nozzle } from './components/scene/Nozzle'
import { Lighting } from './components/scene/Lighting'
import { HUD } from './components/hud/HUD'

const MOBILE_WIDTH = 390

export default function App() {
  return (
    <div style={{
      position: 'relative',
      width: MOBILE_WIDTH,
      maxWidth: '100vw',
      height: '100%',
      background: '#fff',
      overflow: 'hidden',
    }}>
      <GameProvider>
        <Canvas
          camera={{ position: [0, 4, 8], fov: 50 }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <Lighting />
          <Cone />
          <CreamTube />
          <Nozzle />
        </Canvas>
        <HUD />
      </GameProvider>
    </div>
  )
}
