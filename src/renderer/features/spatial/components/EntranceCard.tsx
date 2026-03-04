import type { Vector3Tuple } from 'three'
import { HoloGlassPanel } from './HoloGlassPanel'
import { HoloText } from './HoloText'
import { ENTRANCE_POSITION, ENTRANCE_ANGLE } from '../constants/layout'

const COLOR = '#00e5ff'

export function EntranceCard() {
  const position: Vector3Tuple = ENTRANCE_POSITION
  // Face inward (toward camera at origin)
  const rotation: Vector3Tuple = [0, ENTRANCE_ANGLE + Math.PI, 0]

  return (
    <group position={position} rotation={rotation}>
      <HoloGlassPanel
        width={3.0}
        height={3.6}
        position={[0, 0, 0]}
        edgeColor={COLOR}
      />

      <HoloText
        position={[0, 0.6, 0.05]}
        fontSize={0.22}
        color={COLOR}
        glowColor={COLOR}
      >
        THE HALLS OF
      </HoloText>

      <HoloText
        position={[0, 0.1, 0.05]}
        fontSize={0.28}
        color={COLOR}
        glowColor={COLOR}
      >
        POLYMATHICA
      </HoloText>

      <HoloText
        position={[0, -0.8, 0.05]}
        fontSize={0.1}
        color="#8899aa"
        glowColor={COLOR}
      >
        ENTER THE HALL
      </HoloText>
    </group>
  )
}
