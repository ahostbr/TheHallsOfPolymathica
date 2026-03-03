import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Vector3 } from 'three'
import { useHallStore } from '../store/hallStore'

const LERP_SPEED = 3

export function CameraController() {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)
  const targetPos = useRef(new Vector3(...useHallStore.getState().cameraTarget))
  const targetLook = useRef(new Vector3(...useHallStore.getState().cameraLookAt))
  const depth = useHallStore((s) => s.depth)
  const cameraTarget = useHallStore((s) => s.cameraTarget)
  const cameraLookAt = useHallStore((s) => s.cameraLookAt)

  useFrame((state, delta) => {
    targetPos.current.set(...cameraTarget)
    targetLook.current.set(...cameraLookAt)

    // Smoothly lerp camera position
    camera.position.lerp(targetPos.current, 1 - Math.exp(-LERP_SPEED * delta))

    // Update orbit controls target for alcove/conversation views
    if (controlsRef.current && depth !== 'hall') {
      controlsRef.current.target.lerp(targetLook.current, 1 - Math.exp(-LERP_SPEED * delta))
      controlsRef.current.update()
    }

    state.invalidate()
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={depth === 'hall'}
      enableRotate={depth === 'hall'}
      enablePan={false}
      zoomSpeed={0.5}
      rotateSpeed={0.4}
      minDistance={0.5}
      maxDistance={20}
      makeDefault
    />
  )
}
