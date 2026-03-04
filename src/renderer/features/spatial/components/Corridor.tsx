import { useMemo } from 'react'
import { CorridorPanel } from './CorridorPanel'
import { CorridorFloor } from './CorridorFloor'
import { useCorridorContent } from '../hooks/useCorridorContent'
import { CORRIDOR_PANEL_SPACING } from '../constants/layout'
import { getWingForPolymath, WINGS } from '../constants/wings'

interface CorridorProps {
  polymathId: string
  color: string
  direction: [number, number, number]
  origin: [number, number, number]
}

export function Corridor({ polymathId, color, direction, origin }: CorridorProps) {
  const content = useCorridorContent(polymathId)
  const wingId = getWingForPolymath(polymathId)
  const wingColor = wingId ? WINGS[wingId].color : color

  const panels = useMemo(() => {
    if (!content) return []
    return [
      {
        side: 'left' as const,
        title: content.name.replace('polymathic-', '').toUpperCase(),
        content: content.description,
      },
      { side: 'right' as const, title: 'THE KERNEL', content: content.kernel },
      {
        side: 'left' as const,
        title: 'IDENTITY',
        content: content.identityTraits.join('\n\n'),
      },
      {
        side: 'right' as const,
        title: `PHASE 1: ${content.phases[0]?.name ?? ''}`,
        content: content.phases[0]?.description ?? '',
      },
      {
        side: 'left' as const,
        title: `PHASE 2: ${content.phases[1]?.name ?? ''}`,
        content: content.phases[1]?.description ?? '',
      },
      {
        side: 'right' as const,
        title: `PHASE 3: ${content.phases[2]?.name ?? ''}`,
        content: content.phases[2]?.description ?? '',
      },
      {
        side: 'left' as const,
        title: `PHASE 4: ${content.phases[3]?.name ?? ''}`,
        content: content.phases[3]?.description ?? '',
      },
      {
        side: 'right' as const,
        title: 'OUTPUT FORMAT',
        content: content.outputFormat.slice(0, 400),
      },
      {
        side: 'left' as const,
        title: 'DECISION GATES',
        content: content.decisionGates.join('\n\n'),
      },
      {
        side: 'right' as const,
        title: 'KEY QUOTES',
        content: content.keyQuotes.slice(0, 5).join('\n\n'),
      },
    ]
  }, [content])

  // Panels are at negative local Z. We need local -Z to point OUTWARD from
  // the archway. atan2(x,z) gives the angle FROM +Z toward the direction,
  // but we need the opposite facing, so add PI.
  const angle = Math.atan2(direction[0], direction[2]) + Math.PI

  return (
    <group position={origin} rotation={[0, angle, 0]}>
      <CorridorFloor color={color} />
      {panels.map((panel, i) => (
        <CorridorPanel
          key={i}
          side={panel.side}
          zPosition={-CORRIDOR_PANEL_SPACING * (i * 0.5 + 1)}
          title={panel.title}
          content={panel.content}
          color={wingColor}
          revealAt={(i + 1) / (panels.length + 1)}
        />
      ))}
    </group>
  )
}
