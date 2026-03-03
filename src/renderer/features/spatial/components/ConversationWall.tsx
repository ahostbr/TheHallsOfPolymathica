import { useEffect } from 'react'
import { Html } from '@react-three/drei'
import { HoloGlassPanel } from './HoloGlassPanel'
import { HoloText } from './HoloText'
import { useHallStore, type ConversationData } from '../store/hallStore'
import { PALETTE } from '../constants/palette'

interface ConversationWallProps {
  polymathId: string
  color: string
}

export function ConversationWall({ polymathId, color }: ConversationWallProps) {
  const conversations = useHallStore((s) => s.conversations)
  const setConversations = useHallStore((s) => s.setConversations)

  useEffect(() => {
    async function load() {
      try {
        const rows = await window.api.db.getConversations(polymathId, 10) as ConversationRow[]
        const data: ConversationData[] = rows.map((r) => ({
          id: r.id,
          polymathId: r.polymath_id,
          userPrompt: r.user_prompt,
          fullResponse: r.full_response,
          frameworkSections: r.framework_sections ? JSON.parse(r.framework_sections) : null,
          createdAt: r.created_at,
        }))
        setConversations(data)
      } catch (err) {
        console.error('Failed to load conversations:', err)
      }
    }
    load()
  }, [polymathId, setConversations])

  if (conversations.length === 0) {
    return (
      <group position={[0, -2, -0.5]}>
        <HoloText
          position={[0, 0, 0]}
          fontSize={0.08}
          color={PALETTE.textSecondary}
          glowColor={color}
        >
          No conversations yet
        </HoloText>
      </group>
    )
  }

  return (
    <group position={[0, -2.2, -0.5]}>
      <HoloText
        position={[0, 0.6, 0]}
        fontSize={0.1}
        color={color}
        glowColor={color}
      >
        Past Conversations
      </HoloText>

      {conversations.slice(0, 5).map((conv, i) => (
        <group key={conv.id} position={[(i - 2) * 1.8, 0, 0]}>
          <HoloGlassPanel
            width={1.5}
            height={0.9}
            position={[0, 0, 0]}
            color="#0a1628"
            edgeColor={color}
          >
            <Html
              position={[0, 0, 0.02]}
              transform
              occlude={false}
              style={{
                width: '200px',
                padding: '8px',
                color: PALETTE.textPrimary,
                fontSize: '10px',
                fontFamily: 'JetBrains Mono, monospace',
                overflow: 'hidden',
                pointerEvents: 'none',
              }}
            >
              <div style={{ opacity: 0.6, marginBottom: '4px', fontSize: '8px' }}>
                {new Date(conv.createdAt).toLocaleDateString()}
              </div>
              <div style={{ color, marginBottom: '4px', fontSize: '9px' }}>
                Q: {conv.userPrompt.slice(0, 80)}
                {conv.userPrompt.length > 80 ? '...' : ''}
              </div>
              <div style={{ opacity: 0.7, fontSize: '8px', lineHeight: '1.3' }}>
                {conv.fullResponse.slice(0, 120)}
                {conv.fullResponse.length > 120 ? '...' : ''}
              </div>
            </Html>
          </HoloGlassPanel>
        </group>
      ))}
    </group>
  )
}
