import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useHallStore } from '../store/hallStore'
import { Alcove } from './Alcove'
import { CameraController } from './CameraController'
import {
  RING_0_COUNT,
  RING_1_COUNT,
  getAlcoveTransform,
} from '../constants/layout'

// Default colors for polymaths without a custom color
const DEFAULT_COLORS = [
  '#00e5ff', '#00ff88', '#ff6b35', '#9d4edd', '#ffd700',
  '#ff69b4', '#00bfff', '#ff4500', '#1da1f2', '#dc143c',
]

export function HallLayout() {
  const polymaths = useHallStore((s) => s.polymaths)
  const setPolymaths = useHallStore((s) => s.setPolymaths)
  const { invalidate } = useThree()

  // Load polymaths from database on mount
  useEffect(() => {
    async function loadPolymaths() {
      try {
        const rows = await window.api.db.getAllPolymaths() as PolymathRow[]
        const data = rows.map((row, i) => {
          // Assign ring and index based on position in array
          const ring = i < RING_0_COUNT ? 0 : 1
          const index = i < RING_0_COUNT ? i : i - RING_0_COUNT
          return {
            id: row.id,
            name: row.name,
            title: row.title,
            color: row.color,
            totalSessions: row.total_sessions,
            ring,
            index,
          }
        })
        setPolymaths(data)
        invalidate()
      } catch (err) {
        console.error('Failed to load polymaths:', err)
      }
    }
    loadPolymaths()
  }, [setPolymaths, invalidate])

  return (
    <>
      <CameraController />

      {polymaths.map((polymath) => {
        const { position, rotation } = getAlcoveTransform(polymath.ring, polymath.index)
        return (
          <Alcove
            key={polymath.id}
            polymathId={polymath.id}
            name={polymath.name}
            title={polymath.title}
            color={polymath.color || DEFAULT_COLORS[polymaths.indexOf(polymath) % DEFAULT_COLORS.length]}
            ring={polymath.ring}
            index={polymath.index}
            position={position}
            rotation={rotation}
            totalSessions={polymath.totalSessions}
          />
        )
      })}
    </>
  )
}
