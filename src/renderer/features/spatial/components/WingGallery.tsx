import { useHallStore } from '../store/hallStore'
import { PolymathPortrait } from './PolymathPortrait'
import { HoloText } from './HoloText'
import type { WingDefinition } from '../constants/wings'

interface WingGalleryProps {
  wing: WingDefinition
}

const PORTRAIT_SIZE = 0.8
const PORTRAIT_GAP = 1.1

export function WingGallery({ wing }: WingGalleryProps) {
  const polymaths = useHallStore((s) => s.polymaths)
  const navigateToPolymath = useHallStore((s) => s.navigateToPolymath)
  const wingPolymaths = polymaths.filter((p) => wing.polymathIds.includes(p.id))
  const count = wingPolymaths.length
  const totalWidth = (count - 1) * PORTRAIT_GAP

  return (
    <group position={[0, 3, 0.3]}>
      {wingPolymaths.map((polymath, i) => {
        const x = -totalWidth / 2 + i * PORTRAIT_GAP
        return (
          <group
            key={polymath.id}
            position={[x, 0, 0]}
            onClick={(e) => {
              e.stopPropagation()
              navigateToPolymath(polymath.id)
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              document.body.style.cursor = 'pointer'
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'default'
            }}
          >
            <PolymathPortrait
              polymathId={polymath.id}
              color={polymath.color}
              width={PORTRAIT_SIZE}
              height={PORTRAIT_SIZE}
            />
            <HoloText
              position={[0, -PORTRAIT_SIZE / 2 - 0.2, 0]}
              fontSize={0.08}
              color="#e0f0ff"
              glowColor={wing.color}
            >
              {polymath.name}
            </HoloText>
          </group>
        )
      })}
    </group>
  )
}
