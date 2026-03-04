import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { useHallStore } from '../store/hallStore'
import { Rotunda } from './Rotunda'
import { Corridor } from './Corridor'
import { Alcove } from './Alcove'
import { CameraController } from './CameraController'
import { SplineCameraController } from './SplineCameraController'
import { getWingForPolymath, WINGS } from '../constants/wings'
import { RING_0_COUNT, getAlcoveTransform } from '../constants/layout'

export function RotundaLayout() {
  const polymaths = useHallStore((s) => s.polymaths)
  const setPolymaths = useHallStore((s) => s.setPolymaths)
  const depth = useHallStore((s) => s.depth)
  const activePolymathId = useHallStore((s) => s.activePolymathId)
  const { invalidate } = useThree()

  // Load polymaths from DB on mount
  useEffect(() => {
    async function load() {
      try {
        const rows = (await window.api.db.getAllPolymaths()) as PolymathRow[]
        const data = rows.map((row, i) => ({
          id: row.id,
          name: row.name,
          title: row.title ?? '',
          color: row.color ?? '#00e5ff',
          totalSessions: row.total_sessions,
          ring: i < RING_0_COUNT ? 0 : 1,
          index: i < RING_0_COUNT ? i : i - RING_0_COUNT,
        }))
        setPolymaths(data)
        invalidate()
      } catch (err) {
        console.error('Failed to load polymaths:', err)
      }
    }
    load()
  }, [setPolymaths, invalidate])

  // Find active polymath data for corridor/alcove
  const activePolymath = polymaths.find((p) => p.id === activePolymathId)
  const activeWingId = activePolymathId ? getWingForPolymath(activePolymathId) : null
  const activeWing = activeWingId ? WINGS[activeWingId] : null

  return (
    <>
      <CameraController />
      <SplineCameraController />
      <Rotunda />

      {/* Corridor: mounted during corridor flight and at alcove */}
      {activePolymath && activeWing && (depth === 'corridor' || depth === 'alcove') && (
        <Corridor
          polymathId={activePolymath.id}
          color={activePolymath.color}
          direction={[activeWing.archPosition[0], 0, activeWing.archPosition[2]]}
          origin={[0, 0, 0]}
        />
      )}

      {/* Alcove: at the end of the corridor */}
      {activePolymath && depth === 'alcove' && (
        <Alcove
          polymathId={activePolymath.id}
          name={activePolymath.name}
          title={activePolymath.title}
          color={activePolymath.color}
          ring={activePolymath.ring}
          index={activePolymath.index}
          position={getAlcoveTransform(activePolymath.ring, activePolymath.index).position}
          rotation={getAlcoveTransform(activePolymath.ring, activePolymath.index).rotation}
          totalSessions={activePolymath.totalSessions}
        />
      )}
    </>
  )
}
