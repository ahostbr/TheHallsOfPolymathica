import { Text } from '@react-three/drei'
import type { Vector3Tuple } from 'three'
import { PALETTE } from '../constants/palette'

interface HoloTextProps {
  children: string
  position?: Vector3Tuple
  fontSize?: number
  color?: string
  glowColor?: string
  anchorX?: 'left' | 'center' | 'right'
  anchorY?: 'top' | 'top-baseline' | 'middle' | 'bottom-baseline' | 'bottom'
  maxWidth?: number
}

export function HoloText({
  children,
  position = [0, 0, 0],
  fontSize = 0.15,
  color = PALETTE.textPrimary,
  glowColor = PALETTE.glowPrimary,
  anchorX = 'center',
  anchorY = 'middle',
  maxWidth,
}: HoloTextProps) {
  return (
    <group position={position}>
      {/* Glow layer */}
      <Text
        fontSize={fontSize * 1.02}
        color={glowColor}
        anchorX={anchorX}
        anchorY={anchorY}
        maxWidth={maxWidth}
        position={[0, 0, -0.005]}
        material-transparent
        material-opacity={0.3}
        material-depthWrite={false}
      >
        {children}
      </Text>

      {/* Main text */}
      <Text
        fontSize={fontSize}
        color={color}
        anchorX={anchorX}
        anchorY={anchorY}
        maxWidth={maxWidth}
      >
        {children}
      </Text>
    </group>
  )
}
