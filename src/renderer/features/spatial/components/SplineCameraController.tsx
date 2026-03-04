import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useHallStore } from '../store/hallStore'
import { useSplineFlight } from '../hooks/useSplineFlight'
import { WINGS, getWingForPolymath } from '../constants/wings'
import { CORRIDOR_LENGTH } from '../constants/layout'
import { Vector3 } from 'three'

export function SplineCameraController() {
  const { camera } = useThree()
  const depth = useHallStore((s) => s.depth)
  const activePolymathId = useHallStore((s) => s.activePolymathId)
  const flightDuration = useHallStore((s) => s.corridorFlightDuration)
  const setCorridorProgress = useHallStore((s) => s.setCorridorProgress)

  // Compute spline endpoints from active polymath's wing
  const flightConfig = useMemo(() => {
    if (depth !== 'corridor' || !activePolymathId) return null

    const wingId = getWingForPolymath(activePolymathId)
    if (!wingId) return null
    const wing = WINGS[wingId]

    // Direction from rotunda center toward archway (outward)
    const dir = new Vector3(...wing.archPosition).normalize()
    const archDist = new Vector3(...wing.archPosition).length() // ~15

    // Start: just inside the archway (a few units before the arch)
    const startDist = archDist - 3
    const start: [number, number, number] = [
      dir.x * startDist,
      1.5,
      dir.z * startDist,
    ]

    // End: near the far end of the corridor (archway + corridor length - margin)
    const endDist = archDist + CORRIDOR_LENGTH - 8
    const end: [number, number, number] = [
      dir.x * endDist,
      1.5,
      dir.z * endDist,
    ]

    return { start, end, duration: flightDuration }
  }, [depth, activePolymathId, flightDuration])

  const { advance, reset, progressRef } = useSplineFlight(flightConfig)

  // Reset when a new corridor flight starts
  const prevPolymathRef = useRef<string | null>(null)
  useEffect(() => {
    if (depth === 'corridor' && activePolymathId !== prevPolymathRef.current) {
      reset()
      prevPolymathRef.current = activePolymathId
    }
  }, [depth, activePolymathId, reset])

  useFrame((state, delta) => {
    if (depth !== 'corridor') return

    const result = advance(delta)
    if (!result) return

    camera.position.copy(result.position)
    camera.lookAt(result.lookAt)

    // Report actual progress (0-1) so panels can reveal progressively
    setCorridorProgress(result.completed ? 1 : progressRef.current)

    if (result.completed) {
      useHallStore.getState().arriveAtAlcove()
    }

    state.invalidate()
  })

  return null
}
