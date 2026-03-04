import { useMemo, useCallback, useRef, Suspense } from 'react'
import type { Terminal } from '@xterm/xterm'
import { Html } from '@react-three/drei'
import { CorridorPanel } from './CorridorPanel'
import { CorridorFloor } from './CorridorFloor'
import { HoloGlassPanel } from './HoloGlassPanel'
import { PolymathPortrait } from './PolymathPortrait'
import { HoloText } from './HoloText'
import { TerminalInstance } from '@/components/terminal/TerminalInstance'
import { useCorridorContent } from '../hooks/useCorridorContent'
import { useHallStore } from '../store/hallStore'
import { CORRIDOR_PANEL_SPACING, CORRIDOR_LENGTH, CORRIDOR_WIDTH, CORRIDOR_HEIGHT } from '../constants/layout'
import { getWingForPolymath, WINGS } from '../constants/wings'

interface CorridorProps {
  polymathId: string
  color: string
  name: string
  title: string
  direction: [number, number, number]
  origin: [number, number, number]
}

export function Corridor({ polymathId, color, name, title, direction, origin }: CorridorProps) {
  const content = useCorridorContent(polymathId)
  const wingId = getWingForPolymath(polymathId)
  const wingColor = wingId ? WINGS[wingId].color : color

  const depth = useHallStore((s) => s.depth)
  const activeSessionId = useHallStore((s) => s.activeSessionId)
  const enterConversation = useHallStore((s) => s.enterConversation)
  const terminalFocused = useHallStore((s) => s.terminalFocused)
  const setTerminalFocused = useHallStore((s) => s.setTerminalFocused)
  const terminalScale = useHallStore((s) => s.terminalScale)
  const terminalWidth = useHallStore((s) => s.terminalWidth)
  const terminalHeight = useHallStore((s) => s.terminalHeight)
  const terminalY = useHallStore((s) => s.terminalY)
  const termRef = useRef<Terminal | null>(null)

  const showTerminal = depth === 'alcove' && activeSessionId
  const portraitY = showTerminal ? 8.0 : 5.0
  const nameY = showTerminal ? 6.7 : 3.7
  const titleY = showTerminal ? 6.5 : 3.5

  const handleSpawnTerminal = useCallback(async () => {
    if (activeSessionId) return
    try {
      const sessionId = await window.api.session.spawn(polymathId)
      enterConversation(sessionId)
    } catch (err) {
      console.error('Failed to spawn session:', err)
    }
  }, [polymathId, activeSessionId, enterConversation])

  const handlePortraitClick = useCallback(async () => {
    if (!activeSessionId) return
    const agentPath = await window.api.session.getAgentPath(polymathId)
    window.api.pty.write(activeSessionId, `claude @${agentPath}\r`)
  }, [activeSessionId, polymathId])

  const handleToggleFocus = useCallback(() => {
    const next = !terminalFocused
    setTerminalFocused(next)
    if (next && termRef.current) {
      termRef.current.focus()
    }
  }, [terminalFocused, setTerminalFocused])

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

  // Dynamic spacing: fit all panels before the end wall with clearance
  const usableLength = CORRIDOR_LENGTH - 7
  const effectiveSpacing = panels.length > 0
    ? usableLength / (panels.length * 0.5 + 1)
    : CORRIDOR_PANEL_SPACING

  return (
    <group position={origin} rotation={[0, angle, 0]}>
      <CorridorFloor color={color} />
      {panels.map((panel, i) => (
        <CorridorPanel
          key={i}
          side={panel.side}
          zPosition={-effectiveSpacing * (i * 0.5 + 1)}
          title={panel.title}
          content={panel.content}
          color={wingColor}
          revealAt={(i + 1) / (panels.length + 1)}
        />
      ))}
      {/* End wall at far end of corridor */}
      <HoloGlassPanel
        width={CORRIDOR_WIDTH + 3}
        height={CORRIDOR_HEIGHT + 3}
        position={[0, (CORRIDOR_HEIGHT + 3) / 2, -(CORRIDOR_LENGTH - 2)]}
        edgeColor={wingColor}
      />

      {/* Alcove content on end wall — portrait always visible, terminal at alcove depth */}
      <Suspense fallback={null}>
        <PolymathPortrait
          polymathId={polymathId}
          width={1.8}
          height={2.0}
          position={[0, portraitY, -(CORRIDOR_LENGTH - 2) + 0.05]}
          color={wingColor}
          onClick={activeSessionId ? handlePortraitClick : undefined}
        />
      </Suspense>
      <HoloText
        position={[0, nameY, -(CORRIDOR_LENGTH - 2) + 0.05]}
        fontSize={0.18}
        color={wingColor}
        glowColor={wingColor}
      >
        {name}
      </HoloText>
      {title && (
        <HoloText
          position={[0, titleY, -(CORRIDOR_LENGTH - 2) + 0.05]}
          fontSize={0.1}
          color={wingColor}
          glowColor={wingColor}
        >
          {title}
        </HoloText>
      )}
      {showTerminal && (
        <HoloText
          position={[0, titleY - 0.5, -(CORRIDOR_LENGTH - 2) + 0.05]}
          fontSize={0.14}
          color={wingColor}
          glowColor={wingColor}
          anchorX="center"
        >
          Click portrait to launch Claude with this polymath
        </HoloText>
      )}

      {/* Terminal (only at alcove depth with active session) */}
      {depth === 'alcove' && activeSessionId && (
        <Html
          position={[0, terminalY, -(CORRIDOR_LENGTH - 2) + 0.15]}
          transform
          scale={terminalScale}
          occlude={false}
          style={{
            width: `${terminalWidth}px`,
            height: `${terminalHeight}px`,
            background: 'rgba(0, 0, 0, 0.85)',
            borderRadius: '8px',
            border: `1px solid ${wingColor}40`,
            overflow: 'hidden',
          }}
        >
          <TerminalInstance sessionId={activeSessionId} onTermRef={(t) => { termRef.current = t }} />
        </Html>
      )}

      {/* Focus Terminal toggle button */}
      {showTerminal && (
        <Html
          position={[0, titleY - 0.6, -(CORRIDOR_LENGTH - 2) + 0.15]}
          transform
          scale={0.008}
          occlude={false}
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <button
            onClick={handleToggleFocus}
            onMouseDown={(e) => e.preventDefault()}
            style={{
              background: terminalFocused
                ? `linear-gradient(135deg, ${wingColor}40, ${wingColor}60)`
                : `linear-gradient(135deg, ${wingColor}20, ${wingColor}40)`,
              border: `1px solid ${wingColor}80`,
              color: wingColor,
              padding: '8px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'Orbitron, monospace',
              fontSize: '12px',
              letterSpacing: '2px',
              textTransform: 'uppercase' as const,
            }}
          >
            {terminalFocused ? 'Release Terminal' : 'Focus Terminal'}
          </button>
        </Html>
      )}

      {/* Engage button (only at alcove depth, no active session) */}
      {depth === 'alcove' && !activeSessionId && (
        <Html
          position={[0, 2.0, -(CORRIDOR_LENGTH - 2) + 0.15]}
          transform
          occlude={false}
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={handleSpawnTerminal}
            onMouseDown={(e) => e.preventDefault()}
            style={{
              background: `linear-gradient(135deg, ${wingColor}20, ${wingColor}40)`,
              border: `1px solid ${wingColor}80`,
              color: wingColor,
              padding: '12px 28px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'Orbitron, monospace',
              fontSize: '14px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            Engage {name.split(' ').pop()}
          </button>
        </Html>
      )}
    </group>
  )
}
