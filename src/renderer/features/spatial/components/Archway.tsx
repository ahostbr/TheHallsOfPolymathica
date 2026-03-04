import { useCallback } from 'react'
import { HoloGlassPanel } from './HoloGlassPanel'
import { HoloText } from './HoloText'
import { WingGallery } from './WingGallery'
import { useHallStore } from '../store/hallStore'
import { ARCHWAY_WIDTH, ARCHWAY_HEIGHT } from '../constants/layout'
import type { WingDefinition } from '../constants/wings'

interface ArchwayProps {
  wing: WingDefinition
}

export function Archway({ wing }: ArchwayProps) {
  const navigateToWing = useHallStore((s) => s.navigateToWing)
  const handleClick = useCallback((e: any) => {
    e.stopPropagation()
    navigateToWing(wing.id)
  }, [navigateToWing, wing.id])

  return (
    <group position={wing.archPosition} rotation={wing.archRotation}>
      {/* Invisible click plane behind the glass panel */}
      <mesh
        position={[0, ARCHWAY_HEIGHT / 2, -0.01]}
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'default' }}
      >
        <planeGeometry args={[ARCHWAY_WIDTH, ARCHWAY_HEIGHT]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <HoloGlassPanel
        width={ARCHWAY_WIDTH}
        height={ARCHWAY_HEIGHT}
        position={[0, ARCHWAY_HEIGHT / 2, 0]}
        edgeColor={wing.color}
      />
      <HoloText
        position={[0, ARCHWAY_HEIGHT + 0.5, 0]}
        fontSize={0.35}
        color={wing.color}
        glowColor={wing.color}
      >
        {wing.name.toUpperCase()}
      </HoloText>
      <HoloText
        position={[0, ARCHWAY_HEIGHT - 0.2, 0]}
        fontSize={0.12}
        color="#8899aa"
        glowColor={wing.color}
        maxWidth={ARCHWAY_WIDTH - 0.5}
      >
        {wing.tagline}
      </HoloText>
      <WingGallery wing={wing} />
    </group>
  )
}
