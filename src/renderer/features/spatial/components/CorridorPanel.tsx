import { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { HoloGlassPanel } from './HoloGlassPanel'
import { HoloText } from './HoloText'
import { CORRIDOR_WIDTH } from '../constants/layout'

interface CorridorPanelProps {
  side: 'left' | 'right'
  zPosition: number
  title: string
  content: string
  color: string
  revealDistance?: number
}

const PANEL_WIDTH = 2.8
const PANEL_HEIGHT = 3.5
const REVEAL_DISTANCE = 8
const REVEAL_SPEED = 3

export function CorridorPanel({
  side,
  zPosition,
  title,
  content,
  color,
  revealDistance = REVEAL_DISTANCE,
}: CorridorPanelProps) {
  const { camera } = useThree()
  const revealedRef = useRef(false)
  const opacityRef = useRef(0)
  const [visible, setVisible] = useState(false)

  const x = side === 'left' ? -CORRIDOR_WIDTH / 2 + 0.1 : CORRIDOR_WIDTH / 2 - 0.1
  const rotY = side === 'left' ? Math.PI / 2 : -Math.PI / 2

  useFrame((state, delta) => {
    const camZ = camera.position.z
    if (!revealedRef.current && camZ <= zPosition + revealDistance) {
      revealedRef.current = true
      setVisible(true)
    }
    if (visible && opacityRef.current < 1) {
      opacityRef.current = Math.min(1, opacityRef.current + delta * REVEAL_SPEED)
      state.invalidate()
    }
  })

  if (!visible && opacityRef.current === 0) return null

  return (
    <group position={[x, PANEL_HEIGHT / 2 + 0.3, zPosition]} rotation={[0, rotY, 0]}>
      <HoloGlassPanel width={PANEL_WIDTH} height={PANEL_HEIGHT} position={[0, 0, 0]} edgeColor={color} />
      <HoloText
        position={[0, PANEL_HEIGHT / 2 - 0.4, 0.05]}
        fontSize={0.18}
        color={color}
        glowColor={color}
        maxWidth={PANEL_WIDTH - 0.4}
      >
        {title}
      </HoloText>
      <HoloText
        position={[0, 0, 0.05]}
        fontSize={0.1}
        color="#e0f0ff"
        glowColor={color}
        maxWidth={PANEL_WIDTH - 0.4}
      >
        {content}
      </HoloText>
    </group>
  )
}
