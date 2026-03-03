import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Points } from 'three'
import { PALETTE } from '../constants/palette'

const PARTICLE_COUNT = 300
const FIELD_SIZE = 30
const DRIFT_SPEED = 0.002

export function ParticleField() {
  const pointsRef = useRef<Points>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * FIELD_SIZE
      arr[i * 3 + 1] = (Math.random() - 0.5) * FIELD_SIZE
      arr[i * 3 + 2] = (Math.random() - 0.5) * FIELD_SIZE * 0.5
    }
    return arr
  }, [])

  const sizes = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      arr[i] = Math.random() * 0.03 + 0.01
    }
    return arr
  }, [])

  useFrame((state, delta) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position
    const array = pos.array as Float32Array

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      array[i * 3 + 1] += DRIFT_SPEED * delta * 60

      if (array[i * 3 + 1] > FIELD_SIZE * 0.5) {
        array[i * 3 + 1] = -FIELD_SIZE * 0.5
      }

      array[i * 3] += Math.sin(array[i * 3 + 1] * 0.5) * 0.0003 * delta * 60
    }

    pos.needsUpdate = true
    state.invalidate()
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={PARTICLE_COUNT}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
          count={PARTICLE_COUNT}
        />
      </bufferGeometry>
      <pointsMaterial
        color={PALETTE.particleColor}
        size={0.03}
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
