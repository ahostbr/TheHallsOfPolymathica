import { useMemo, useRef } from 'react'
import { CatmullRomCurve3, Vector3 } from 'three'

export interface SplineFlightConfig {
  start: [number, number, number]
  end: [number, number, number]
  duration: number // seconds
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t)
}

export function useSplineFlight(config: SplineFlightConfig | null) {
  const progressRef = useRef(0)
  const completedRef = useRef(false)

  const curve = useMemo(() => {
    if (!config) return null
    const { start, end } = config
    const s = new Vector3(...start)
    const e = new Vector3(...end)

    // Mid-points for smooth curve with subtle upward arc
    const mid = new Vector3().lerpVectors(s, e, 0.5)
    mid.y += 0.5

    const cp1 = new Vector3().lerpVectors(s, mid, 0.5)
    const cp2 = new Vector3().lerpVectors(mid, e, 0.5)

    return new CatmullRomCurve3([s, cp1, mid, cp2, e])
  }, [config])

  function reset() {
    progressRef.current = 0
    completedRef.current = false
  }

  function advance(delta: number): {
    position: Vector3
    lookAt: Vector3
    completed: boolean
  } | null {
    if (!curve || !config || completedRef.current) return null

    progressRef.current = Math.min(1, progressRef.current + delta / config.duration)
    const t = smoothstep(progressRef.current)

    const position = curve.getPointAt(t)
    // Look ahead on the curve. Near the end (t > 0.95), use the tangent
    // direction instead of a point on the curve to avoid zero-length lookAt.
    let lookAt: Vector3
    if (t < 0.95) {
      const lookT = Math.min(0.99, t + 0.05)
      lookAt = curve.getPointAt(lookT)
    } else {
      const tangent = curve.getTangentAt(Math.min(t, 0.99))
      lookAt = position.clone().add(tangent.multiplyScalar(2))
    }

    if (progressRef.current >= 1) {
      completedRef.current = true
    }

    return { position, lookAt, completed: completedRef.current }
  }

  return { advance, reset, progressRef, completedRef }
}
