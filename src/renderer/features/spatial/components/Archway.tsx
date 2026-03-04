import { HoloGlassPanel } from './HoloGlassPanel'
import { HoloText } from './HoloText'
import { WingGallery } from './WingGallery'
import { ARCHWAY_WIDTH, ARCHWAY_HEIGHT } from '../constants/layout'
import type { WingDefinition } from '../constants/wings'

interface ArchwayProps {
  wing: WingDefinition
}

export function Archway({ wing }: ArchwayProps) {
  return (
    <group position={wing.archPosition} rotation={wing.archRotation}>
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
