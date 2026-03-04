import { useHallStore } from '../store/hallStore'
import { PolymathPortrait } from './PolymathPortrait'
import { HoloText } from './HoloText'
import type { WingDefinition } from '../constants/wings'

interface WingGalleryProps {
  wing: WingDefinition
}

const PORTRAIT_SIZE = 0.65
const COL_GAP = 1.15
const ROW_GAP = 1.6

export function WingGallery({ wing }: WingGalleryProps) {
  const polymaths = useHallStore((s) => s.polymaths)
  const navigateToPolymath = useHallStore((s) => s.navigateToPolymath)
  const wingPolymaths = polymaths.filter((p) => wing.polymathIds.includes(p.id))
  const count = wingPolymaths.length

  // Split into 2 rows: top row gets ceil(n/2), bottom gets floor(n/2)
  const topRow = wingPolymaths.slice(0, Math.ceil(count / 2))
  const bottomRow = wingPolymaths.slice(Math.ceil(count / 2))

  function renderRow(
    row: typeof wingPolymaths,
    yOffset: number,
  ) {
    const rowWidth = (row.length - 1) * COL_GAP
    return row.map((polymath, i) => {
      const x = -rowWidth / 2 + i * COL_GAP
      return (
        <group
          key={polymath.id}
          position={[x, yOffset, 0]}
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
            position={[0, -PORTRAIT_SIZE / 2 - 0.15, 0]}
            fontSize={0.07}
            color="#e0f0ff"
            glowColor={wing.color}
          >
            {polymath.name}
          </HoloText>
          <HoloText
            position={[0, -PORTRAIT_SIZE / 2 - 0.3, 0]}
            fontSize={0.05}
            color="#667788"
            glowColor={wing.color}
          >
            {polymath.title}
          </HoloText>
        </group>
      )
    })
  }

  return (
    <group position={[0, 3.5, 0.3]}>
      {renderRow(topRow, ROW_GAP / 2)}
      {renderRow(bottomRow, -ROW_GAP / 2)}
    </group>
  )
}
