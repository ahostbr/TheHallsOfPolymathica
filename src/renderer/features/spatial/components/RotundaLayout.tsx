import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import type { Vector3Tuple } from 'three'
import { useHallStore } from '../store/hallStore'
import { Rotunda } from './Rotunda'
import { Corridor } from './Corridor'
import { Alcove } from './Alcove'
import { CameraController } from './CameraController'
import { SplineCameraController } from './SplineCameraController'
import { getWingForPolymath, WINGS } from '../constants/wings'
import type { WingDefinition } from '../constants/wings'
import type { PolymathData } from '../store/hallStore'
import { RING_0_COUNT, CORRIDOR_LENGTH } from '../constants/layout'

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
          origin={[activeWing.archPosition[0], 0, activeWing.archPosition[2]]}
        />
      )}

      {/* Alcove: at the end of the corridor */}
      {activePolymath && activeWing && depth === 'alcove' && (
        <AlcoveAtCorridorEnd activeWing={activeWing} activePolymath={activePolymath} />
      )}
    </>
  )
}

/** Positions the Alcove at the far end of the active corridor */
function AlcoveAtCorridorEnd({
  activeWing,
  activePolymath,
}: {
  activeWing: WingDefinition
  activePolymath: PolymathData
}) {
  const pos = useMemo<Vector3Tuple>(() => {
    const dir = new Vector3(...activeWing.archPosition).normalize()
    const archDist = new Vector3(...activeWing.archPosition).length()
    const endDist = archDist + CORRIDOR_LENGTH - 3
    return [dir.x * endDist, 1.5, dir.z * endDist]
  }, [activeWing])

  const rot = useMemo<Vector3Tuple>(() => {
    const angle = Math.atan2(activeWing.archPosition[0], activeWing.archPosition[2])
    return [0, angle + Math.PI, 0]
  }, [activeWing])

  return (
    <Alcove
      polymathId={activePolymath.id}
      name={activePolymath.name}
      title={activePolymath.title}
      color={activePolymath.color}
      position={pos}
      rotation={rot}
      totalSessions={activePolymath.totalSessions}
    />
  )
}
