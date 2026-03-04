import { useRef, useCallback, Suspense } from 'react'
import type { Group, Vector3Tuple } from 'three'
import { Html } from '@react-three/drei'
import { HoloGlassPanel } from './HoloGlassPanel'
import { HoloText } from './HoloText'
import { PolymathPortrait } from './PolymathPortrait'
import { PolymathBust } from './PolymathBust'
import { useHallStore } from '../store/hallStore'
import { TerminalInstance } from '@/components/terminal/TerminalInstance'

const POLYMATH_MODELS: Record<string, string> = {
  davinci: 'models/davinci.glb',
}

interface AlcoveProps {
  polymathId: string
  name: string
  title: string | null
  color: string
  ring: number
  index: number
  position: Vector3Tuple
  rotation: Vector3Tuple
  totalSessions: number
}

export function Alcove({
  polymathId,
  name,
  title,
  color,
  ring,
  index,
  position,
  rotation,
}: AlcoveProps) {
  const groupRef = useRef<Group>(null)
  const depth = useHallStore((s) => s.depth)
  const activePolymathId = useHallStore((s) => s.activePolymathId)
  const activeSessionId = useHallStore((s) => s.activeSessionId)
  const enterConversation = useHallStore((s) => s.enterConversation)

  const isActive = activePolymathId === polymathId
  const showTerminal = isActive && depth === 'alcove'
  const modelPath = POLYMATH_MODELS[polymathId]

  const handleSpawnTerminal = useCallback(async () => {
    if (activeSessionId) return
    try {
      const sessionId = await window.api.session.spawn(polymathId)
      enterConversation(sessionId)
    } catch (err) {
      console.error('Failed to spawn session:', err)
    }
  }, [polymathId, activeSessionId, enterConversation])

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
    >
      {/* Glass panel backdrop */}
      <HoloGlassPanel
        width={2.6}
        height={3.0}
        position={[0, 0, 0]}
        edgeColor={color}
      />

      {/* 2D portrait */}
      <Suspense fallback={null}>
        <PolymathPortrait
          polymathId={polymathId}
          width={1.8}
          height={2.0}
          position={[0, 0.2, 0.05]}
          color={color}
        />
      </Suspense>

      {/* 3D bust (only davinci has a model) */}
      {modelPath && (
        <Suspense fallback={null}>
          <PolymathBust
            modelPath={modelPath}
            position={[0, 0.2, 0.3]}
            scale={0.8}
            color={color}
          />
        </Suspense>
      )}

      {/* Name label */}
      <HoloText
        position={[0, -1.3, 0.05]}
        fontSize={0.18}
        color={color}
        glowColor={color}
      >
        {name}
      </HoloText>

      {/* Title label */}
      {title && (
        <HoloText
          position={[0, -1.55, 0.05]}
          fontSize={0.1}
          color={color}
          glowColor={color}
        >
          {title}
        </HoloText>
      )}

      {/* Embedded terminal (only when alcove is active) */}
      {showTerminal && activeSessionId && (
        <Html
          position={[0, -0.8, 0.3]}
          transform
          occlude={false}
          style={{
            width: '600px',
            height: '300px',
            background: 'rgba(0, 0, 0, 0.85)',
            borderRadius: '8px',
            border: `1px solid ${color}40`,
            overflow: 'hidden',
          }}
        >
          <TerminalInstance sessionId={activeSessionId} />
        </Html>
      )}

      {/* Engage button (shown when alcove is active but no terminal) */}
      {isActive && depth === 'alcove' && !activeSessionId && (
        <Html
          position={[0, -0.6, 0.3]}
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
              background: `linear-gradient(135deg, ${color}20, ${color}40)`,
              border: `1px solid ${color}80`,
              color: color,
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
