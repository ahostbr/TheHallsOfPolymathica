import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Vector3 } from 'three'
import { useHallStore } from '../store/hallStore'

const LERP_SPEED = 3
const ARRIVE_THRESHOLD = 0.01

export function CameraController() {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)
  const targetPos = useRef(new Vector3())
  const targetLook = useRef(new Vector3())
  const isTransitioning = useRef(false)
  const prevDepth = useRef<string>('hall')
  const prevCameraTarget = useRef<string>('')

  // Save hall camera state so we can restore it on "back"
  const savedHallPos = useRef(new Vector3(0, 1.5, 0.01))
  const savedHallLook = useRef(new Vector3(0, 1.0, 0))

  const depth = useHallStore((s) => s.depth)
  const cameraTarget = useHallStore((s) => s.cameraTarget)
  const cameraLookAt = useHallStore((s) => s.cameraLookAt)

  // Detect camera target changes and save/restore hall position
  const targetKey = cameraTarget.join(',')
  useEffect(() => {
    if (targetKey !== prevCameraTarget.current) {
      // Leaving hall → save current camera state
      if (prevDepth.current === 'hall' && depth !== 'hall') {
        savedHallPos.current.copy(camera.position)
        if (controlsRef.current) {
          savedHallLook.current.copy(controlsRef.current.target)
        }
      }

      // Returning to hall → override targets with saved position
      if (depth === 'hall' && prevDepth.current !== 'hall') {
        targetPos.current.copy(savedHallPos.current)
        targetLook.current.copy(savedHallLook.current)
      }

      // Immediately disable OrbitControls and save state to prevent start-snap
      if (controlsRef.current) {
        controlsRef.current.saveState()
        controlsRef.current.enabled = false
      }

      isTransitioning.current = true
      prevCameraTarget.current = targetKey
      prevDepth.current = depth
    }
  }, [targetKey, depth, camera])

  // ESC key handler inside the Canvas context
  useEffect(() => {
    const navigateToHall = useHallStore.getState().navigateToHall
    const exitConversation = useHallStore.getState().exitConversation

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        const currentDepth = useHallStore.getState().depth
        if (currentDepth === 'conversation') exitConversation()
        else if (currentDepth === 'alcove') navigateToHall()
      }
    }
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [])

  useFrame((state, delta) => {
    // For hall return, use saved position; otherwise use store targets
    if (depth === 'hall' && isTransitioning.current) {
      targetPos.current.copy(savedHallPos.current)
      targetLook.current.copy(savedHallLook.current)
    } else if (!isTransitioning.current || depth !== 'hall') {
      targetPos.current.set(...cameraTarget)
      targetLook.current.set(...cameraLookAt)
    }

    if (isTransitioning.current) {
      camera.position.lerp(targetPos.current, 1 - Math.exp(-LERP_SPEED * delta))

      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLook.current, 1 - Math.exp(-LERP_SPEED * delta))
      }

      const dist = camera.position.distanceTo(targetPos.current)
      if (dist < ARRIVE_THRESHOLD) {
        isTransitioning.current = false
        // Snap to exact final position — no gap
        camera.position.copy(targetPos.current)
        if (controlsRef.current) {
          controlsRef.current.target.copy(targetLook.current)
          controlsRef.current.enabled = true
          // Don't call update() — let OrbitControls sync naturally next frame
        }
      }
    }

    state.invalidate()
  })

  return (
    <OrbitControls
      ref={controlsRef}
      target={[0, 1.0, 0]}
      enableZoom
      enableRotate
      enablePan={false}
      zoomSpeed={0.3}
      rotateSpeed={0.3}
      minDistance={0.5}
      maxDistance={14}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={(3 * Math.PI) / 4}
      makeDefault
    />
  )
}
