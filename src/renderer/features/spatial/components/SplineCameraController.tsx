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

    // Direction from rotunda center toward archway
    const dir = new Vector3(...wing.archPosition).normalize()

    // Start: just inside the archway (~60% of rotunda radius)
    const start: [number, number, number] = [
      dir.x * 9,
      1.5,
      dir.z * 9,
    ]

    // End: near the far end of the corridor
    const end: [number, number, number] = [
      dir.x * (CORRIDOR_LENGTH - 5),
      1.5,
      dir.z * (CORRIDOR_LENGTH - 5),
    ]

    return { start, end, duration: flightDuration }
  }, [depth, activePolymathId, flightDuration])

  const { advance, reset } = useSplineFlight(flightConfig)

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

    setCorridorProgress(result.completed ? 1 : 0)

    if (result.completed) {
      useHallStore.getState().arriveAtAlcove()
    }

    state.invalidate()
  })

  return null
}
