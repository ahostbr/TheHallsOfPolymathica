import { useRef, useCallback, useMemo, Suspense } from 'react'
import type { Group, Vector3Tuple } from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { HoloGlassPanel } from './HoloGlassPanel'
import { HoloText } from './HoloText'
import { PolymathPortrait } from './PolymathPortrait'
import { PolymathBust } from './PolymathBust'

const POLYMATH_MODELS: Record<string, string> = {
  davinci: 'models/davinci.glb',
}
import { useHallStore } from '../store/hallStore'
import { getAlcoveCameraTarget } from '../constants/layout'
import { PALETTE } from '../constants/palette'
import { TerminalInstance } from '@/components/terminal/TerminalInstance'

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
  totalSessions,
}: AlcoveProps) {
  const groupRef = useRef<Group>(null)
  const { invalidate } = useThree()
  const depth = useHallStore((s) => s.depth)
  const activePolymathId = useHallStore((s) => s.activePolymathId)
  const activeSessionId = useHallStore((s) => s.activeSessionId)
  const navigateToAlcove = useHallStore((s) => s.navigateToAlcove)
  const enterConversation = useHallStore((s) => s.enterConversation)

  const isActive = activePolymathId === polymathId
  const isHallView = depth === 'hall'
  const showTerminal = isActive && (depth === 'alcove' || depth === 'conversation')

  const handleClick = useCallback(() => {
    if (depth === 'hall') {
      const { position: camPos, lookAt } = getAlcoveCameraTarget(ring, index)
      navigateToAlcove(polymathId, camPos, lookAt)
      invalidate()
    }
  }, [depth, ring, index, polymathId, navigateToAlcove, invalidate])

  const handleSpawnTerminal = useCallback(async () => {
    if (activeSessionId) return
    try {
      const sessionId = await window.api.session.spawn(polymathId)
      enterConversation(sessionId)
    } catch (err) {
      console.error('Failed to spawn session:', err)
    }
  }, [polymathId, activeSessionId, enterConversation])

  // Glow intensity based on state
  const glowIntensity = isActive ? 1.5 : 0.5

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={handleClick}
    >
      {/* Alcove background panel */}
      <HoloGlassPanel
        width={3.2}
        height={3.0}
        position={[0, 0, -0.1]}
        color={isActive ? '#0f2a40' : '#0a1628'}
        edgeColor={color}
      />

      {/* Point light for polymath glow */}
      <pointLight
        position={[0, 0, 0.5]}
        intensity={glowIntensity}
        color={color}
        distance={4}
        decay={2}
      />

      {/* Name label */}
      <HoloText
        position={[0, 1.2, 0.05]}
        fontSize={0.18}
        color={color}
        glowColor={color}
      >
        {name}
      </HoloText>

      {/* Title */}
      {title && (
        <HoloText
          position={[0, 0.95, 0.05]}
          fontSize={0.09}
          color={PALETTE.textSecondary}
          glowColor={color}
        >
          {title}
        </HoloText>
      )}

      {/* Session count badge */}
      {totalSessions > 0 && (
        <HoloText
          position={[1.3, 1.2, 0.05]}
          fontSize={0.08}
          color={PALETTE.textSecondary}
          glowColor={color}
        >
          {`${totalSessions} sessions`}
        </HoloText>
      )}

      {/* Portrait */}
      <Suspense
        fallback={
          <HoloGlassPanel
            width={1.4}
            height={1.6}
            position={[0, 0, 0.05]}
            color={color + '22'}
            edgeColor={color}
          >
            <HoloText
              position={[0, 0, 0.02]}
              fontSize={0.5}
              color={color}
              glowColor={color}
            >
              {name.charAt(0)}
            </HoloText>
          </HoloGlassPanel>
        }
      >
        <PolymathPortrait
          polymathId={polymathId}
          color={color}
        />
      </Suspense>

      {/* 3D Bust (if model exists for this polymath) */}
      {POLYMATH_MODELS[polymathId] && (
        <Suspense fallback={null}>
          <PolymathBust
            modelPath={POLYMATH_MODELS[polymathId]}
            position={[0.9, -0.1, 0.2]}
            scale={0.8}
            color={color}
          />
        </Suspense>
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
